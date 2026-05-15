import { useState, useRef, useEffect, useCallback } from 'react';
import { VoiceVisualizer } from './VoiceVisualizer.jsx';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder.js';

// ElevenLabs voice IDs
const VOICES = {
  rachel: '21m00Tcm4TlvDq8ikWAM', // Professional female
  adam: 'AZnzlk1XvdvUeBnXmlld',    // Professional male  
  bella: 'EXAVITQu4vr4xnSDxKNL',   // Warm female
};

export default function VoiceChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('rachel');
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  
  const { 
    isRecording, 
    audioBlob, 
    error: recorderError, 
    duration,
    startRecording, 
    stopRecording,
    reset 
  } = useVoiceRecorder();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle recording completion
  useEffect(() => {
    if (audioBlob && !isRecording) {
      processAudio();
    }
  }, [audioBlob, isRecording]);

  // Keyboard shortcut: Space to toggle recording
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && !e.target.matches('input, textarea')) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else if (!isProcessing && !isSpeaking) {
          startRecording();
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, isProcessing, isSpeaking]);

  const processAudio = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      // Convert webm to mp3 for whisper
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Transcribe with local Whisper (no API key needed!)
      const whisperRes = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!whisperRes.ok) {
        const error = await whisperRes.json();
        throw new Error(error.error || 'Transcription failed');
      }

      const { text } = await whisperRes.json();
      
      if (!text || !text.trim()) {
        throw new Error('No speech detected');
      }

      // Add user message
      const userMsg = { role: 'user', text, timestamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);

      // Get Nova's response via OpenClaw
      const novaRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!novaRes.ok) {
        throw new Error('Nova response failed');
      }

      const novaData = await novaRes.json();
      const novaText = novaData.response || novaData.message || 'I\'m not sure how to respond to that.';
      
      setMessages(prev => [...prev, { role: 'assistant', text: novaText, timestamp: Date.now() }]);

      // Speak the response
      await speakText(novaText);

    } catch (err) {
      console.error('Voice processing error:', err);
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: `Error: ${err.message}`, 
        timestamp: Date.now(),
        isError: true 
      }]);
    } finally {
      setIsProcessing(false);
      reset();
    }
  };

  const speakText = async (text) => {
    setIsSpeaking(true);
    
    try {
      const voiceId = VOICES[selectedVoice];
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json'
          // API key is on the server, not needed here
        },
        body: JSON.stringify({
          text,
          voiceId,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error('TTS failed: ' + await response.text());
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }

    } catch (err) {
      console.error('Speech error:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const saveSettings = () => {
    setShowSettings(false);
  };

  return (
    <>
      {/* Global persistent HUD for voice state when closed */}
      {!isOpen && (isRecording || isProcessing || isSpeaking) && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-5 py-2.5 rounded-full bg-black/80 border border-synapse-cyan/30 backdrop-blur-xl shadow-lg shadow-synapse-cyan/20 transition-all">
          <div className="w-2.5 h-2.5 rounded-full bg-synapse-cyan animate-pulse" />
          <VoiceVisualizer isActive={isRecording} isSpeaking={isSpeaking} />
          <span className="text-[10px] text-synapse-cyan uppercase tracking-widest font-medium">
            {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : 'Speaking...'}
          </span>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm mobile-safe-area voice-chat-modal md:items-center md:p-0">
          <div className="w-full max-w-2xl mx-4 rounded-3xl border border-synapse-cyan/30 bg-black/80 backdrop-blur-xl shadow-2xl shadow-synapse-cyan/20 overflow-hidden mobile-safe-top md:rounded-3xl md:mx-4 md:min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-synapse-cyan animate-pulse" />
            <h2 className="text-lg font-medium text-nova-50">Voice Chat</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-xl hover:bg-white/10 transition-colors text-nova-300 btn-touch no-select"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-3 rounded-xl hover:bg-white/10 transition-colors text-nova-300 btn-touch no-select"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.03]">
            <div className="space-y-4">
              {/* API Key moved to backend securely */}
              
              <div>
                <label className="block text-sm text-nova-300 mb-2">Voice</label>
                <div className="flex gap-2">
                  {Object.keys(VOICES).map((voice) => (
                    <button
                      key={voice}
                      onClick={() => setSelectedVoice(voice)}
                      className={`px-4 py-3 rounded-full text-sm capitalize transition-colors btn-touch ${
                        selectedVoice === voice
                          ? 'bg-synapse-cyan/30 text-synapse-cyan border border-synapse-cyan/50'
                          : 'bg-white/10 text-nova-300 border border-transparent hover:bg-white/20'
                      }`}
                    >
                      {voice}
                    </button>
                  ))}
                </div>
              </div>


              <button
                onClick={saveSettings}
                className="px-5 py-3 rounded-xl bg-synapse-cyan/20 text-synapse-cyan border border-synapse-cyan/40 hover:bg-synapse-cyan/30 transition-colors btn-touch"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="h-64 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-nova-500 py-8">
              <p className="text-sm">Hold <span className="text-synapse-cyan font-mono">SPACE</span> to speak</p>
              <p className="text-xs mt-2">Or click the microphone button</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`
}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-synapse-cyan/20 text-synapse-cyan border border-synapse-cyan/30'
                    : msg.isError
                    ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                    : 'bg-white/10 text-nova-200 border border-white/10'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div className="px-6 py-6 border-t border-white/10 flex flex-col items-center gap-4">
          <VoiceVisualizer 
            isActive={isRecording} 
            isSpeaking={isSpeaking} 
          />

          <div className="flex items-center gap-4">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={isRecording ? stopRecording : undefined}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
              className={`voice-mic-btn rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500/30 border-2 border-red-500 scale-110'
                  : isProcessing
                  ? 'bg-nova-500/30 border-2 border-nova-500'
                  : 'bg-synapse-cyan/20 border-2 border-synapse-cyan hover:bg-synapse-cyan/30'
              }`}
            >
              {isRecording ? (
                <div className="w-6 h-6 rounded bg-red-400" />
              ) : isProcessing ? (
                <div className="w-6 h-6 rounded-full border-2 border-nova-300 border-t-transparent animate-spin" />
              ) : (
                <svg className="w-6 h-6 text-synapse-cyan" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              )}
            </button>
          </div>

          <div className="text-center">
            {isRecording && (
              <span className="text-sm text-red-400 animate-pulse">Recording... {duration}s</span>
            )}
            {isProcessing && (
              <span className="text-sm text-nova-400">Processing...</span>
            )}
            {isSpeaking && (
              <span className="text-sm text-synapse-cyan">Speaking...</span>
            )}
            {recorderError && (
              <span className="text-sm text-red-400">{recorderError}</span>
            )}
          </div>

          <audio ref={audioRef} className="hidden" />
        </div>
      </div>
    </div>
    )}
    </>
  );
}
