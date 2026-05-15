import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { watch } from 'fs';
import os from 'os';

const app = express();
const upload = multer({ dest: os.tmpdir() });

// Convert audio to WAV format using ffmpeg
async function convertToWav(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-ar', '16000',  // 16kHz sample rate (Whisper expects this)
      '-ac', '1',      // Mono
      '-c:a', 'pcm_s16le',  // 16-bit PCM
      '-y',            // Overwrite output
      outputPath
    ], { timeout: 30000 });

    let errorOutput = '';
    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg conversion failed: ${errorOutput}`));
      } else {
        resolve();
      }
    });

    ffmpeg.on('error', reject);
  });
}

// Transcribe audio using local Whisper
app.post('/api/voice/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  const inputPath = req.file.path;
  const wavPath = inputPath + '.wav';
  const outputDir = os.tmpdir();
  
  try {
    // Convert to WAV format first (browsers send webm/opus)
    console.log('Converting audio to WAV format...');
    await convertToWav(inputPath, wavPath);
    
    // Run whisper locally on the converted file
    const result = await new Promise((resolve, reject) => {
      const whisper = spawn('whisper', [
        wavPath,
        '--model', 'base',
        '--language', 'en',
        '--output_format', 'txt',
        '--output_dir', outputDir,
        '--fp16', 'False'
      ], {
        timeout: 30000
      });

      let output = '';
      let errorOutput = '';

      whisper.stdout.on('data', (data) => {
        output += data.toString();
      });

      whisper.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      whisper.on('close', async (code) => {
        // Clean up files
        try {
          await fs.unlink(inputPath);
          await fs.unlink(wavPath);
        } catch {}

        if (code !== 0) {
          reject(new Error(`Whisper failed: ${errorOutput}`));
          return;
        }

        // Read the transcription output
        const outputFile = path.join(outputDir, path.basename(wavPath, '.wav') + '.txt');
        try {
          const text = await fs.readFile(outputFile, 'utf-8');
          await fs.unlink(outputFile).catch(() => {});
          resolve(text.trim());
        } catch {
          // If file doesn't exist, try to parse from stdout
          const lines = output.split('\n').filter(l => l.trim());
          resolve(lines[lines.length - 1] || '');
        }
      });

      whisper.on('error', reject);
    });

    res.json({ text: result });

  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Speak text using ElevenLabs (API key from env or header)
app.post('/api/voice/speak', express.json(), async (req, res) => {
  const { text, voiceId = 'XB0fDUnXU5powFXDhCwa' } = req.body;  // Bella - soft, warm, flirty
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  // Try header first, then env var
  const apiKey = req.headers['xi-api-key'] || process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(401).json({ error: 'ElevenLabs API key required' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.35,        // Lower = more expressive, less robotic
          similarity_boost: 0.85,   // Higher = more natural inflection
          style: 0.4,               // Add some style/expressiveness
          use_speaker_boost: true   // Enhance clarity
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${errorText}`);
    }

    // Get audio buffer and send it
    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Proxy chat to OpenClaw
app.post('/api/chat', express.json(), async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // Send message to OpenClaw via the local API
    // Using the sessions_send approach via HTTP
    const response = await fetch('http://127.0.0.1:18789/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        sessionKey: 'agent:main:whatsapp:direct:+46729623652'
      })
    });

    if (!response.ok) {
      // Fallback: just echo for testing
      return res.json({
        response: `I received your message: "${message}". The OpenClaw chat API isn't fully wired yet, but I can speak!`,
        message: `I received your message: "${message}". The OpenClaw chat API isn't fully wired yet, but I can speak!`
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error('Chat error:', err);
    // Fallback response
    res.json({
      response: `You said: "${message}". I'm running in voice mode! 🎙️`,
      message: `You said: "${message}". I'm running in voice mode! 🎙️`
    });
  }
});

// Delete archive (moves to .trash)
app.post('/api/archive/delete', express.json(), async (req, res) => {
  const { path: filePath } = req.body;
  if (!filePath) {
    return res.status(400).json({ error: 'No path provided' });
  }

  try {
    const trashDir = path.join(os.homedir(), '.openclaw', 'workspace', '.trash');
    await fs.mkdir(trashDir, { recursive: true });

    const filename = path.basename(filePath);
    const destPath = path.join(trashDir, `${Date.now()}_${filename}`);
    
    // Move the file
    await fs.rename(filePath, destPath);
    console.log(`Moved ${filePath} to trash: ${destPath}`);
    
    res.json({ success: true, message: 'Moved to trash' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Quick Actions endpoint
app.post('/api/action', express.json(), async (req, res) => {
  const { command, id } = req.body;
  if (!command || !id) {
    return res.status(400).json({ ok: false, error: 'Missing command or id' });
  }

  // Whitelist of allowed commands for safety
  const ALLOWED_COMMANDS = {
    'restart-gateway': 'openclaw gateway restart',
    'kill-stuck': 'openclaw tasks maintenance --apply',
    'run-heartbeat': 'echo HEARTBEAT_OK',
    'refresh-models': 'openclaw models status --probe --json',
    'nova-rebuild': 'cd ~/.openclaw/workspace/projects/_active/openclaw-nova-hub \u0026\u0026 npm run build'
  };

  const safeCommand = ALLOWED_COMMANDS[id];
  if (!safeCommand || safeCommand !== command) {
    return res.status(403).json({ ok: false, error: 'Command not allowed' });
  }

  try {
    const { execSync } = await import('child_process');
    const output = execSync(safeCommand, { 
      encoding: 'utf8', 
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    res.json({ ok: true, output: output.slice(0, 500) });
  } catch (e) {
    res.json({ ok: false, error: e.message, output: e.stdout?.toString?.().slice(0, 500) || '' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'voice-api' });
});

// Server-Sent Events (SSE) for Real-Time Continuity
const clients = new Set();

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Send initial connected event
  res.write('data: {"type":"connected"}\n\n');

  const client = res;
  clients.add(client);

  req.on('close', () => {
    clients.delete(client);
  });
});

// Watch public directory for changes to trigger SSE
try {
  // Use path.resolve to get absolute path to public/
  const publicDir = path.resolve(process.cwd(), 'public');
  let debounceTimer = null;
  
  watch(publicDir, (eventType, filename) => {
    if (!filename || !filename.endsWith('.json')) return;
    
    // Debounce to prevent multiple fires for a single file write
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const msg = `data: ${JSON.stringify({ type: 'file_changed', file: filename })}\n\n`;
      for (const client of clients) {
        client.write(msg);
      }
    }, 100);
  });
  console.log(`Watching ${publicDir} for SSE real-time updates`);
} catch (err) {
  console.error('Failed to setup fs.watch for SSE:', err);
}

const PORT = process.env.VOICE_PORT || 5179;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Voice API server running on http://127.0.0.1:${PORT}`);
});

export default app;
