#!/usr/bin/env node
/**
 * scan-youtube.mjs — Scan YouTube transcripts and analyses
 * Stricter matching: only actual YouTube transcript files, not docs with links
 */

import fs from 'fs/promises';
import path from 'path';

const WORKSPACE_DIR = path.join(process.env.HOME || '/Users/joao', '.openclaw', 'workspace');
const INBOX_DIR = path.join(WORKSPACE_DIR, 'inbox');
const YOUTUBE_DIR = path.join(WORKSPACE_DIR, 'projects', 'youtube-ingestion');

const OUTPUT_FILE = path.join(process.cwd(), 'public', 'youtube-videos.json');

// Indicators that a file is actually a YouTube transcript
const YOUTUBE_INDICATORS = [
  'youtube transcript',
  'video transcript',
  'transcript of',
  'video analysis',
  'youtube video',
  'published on',
  'channel:',
  'duration:',
  'views:',
  'transcribed from'
];

// Skip files that are clearly not YouTube content
const SKIP_PATTERNS = [
  /^meeting/i,
  /^project/i,
  /^report/i,
  /^status/i,
  /^forecast/i,
  /^alignment/i,
  /^ssc\s/i,
  /delphine/i,
  /cfo opportunity/i
];

async function isYouTubeTranscript(filePath, content) {
  const fileName = path.basename(filePath).toLowerCase();
  
  // Skip files with meeting/project patterns
  if (SKIP_PATTERNS.some(p => p.test(fileName))) return false;
  
  // Check for YouTube video ID in content
  const videoIdMatch = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch) return false;
  
  // Check for YouTube-specific content indicators
  const contentLower = content.toLowerCase();
  const hasIndicators = YOUTUBE_INDICATORS.some(ind => contentLower.includes(ind));
  
  // Must have video ID AND either indicators OR be in youtube-ingestion folder
  if (hasIndicators) return true;
  if (filePath.includes('youtube-ingestion')) return true;
  
  // If file is long (> 2000 chars) and has video ID, likely a transcript
  if (content.length > 2000) return true;
  
  return false;
}

async function scanYouTubeFiles(dir, videos) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        await scanYouTubeFiles(fullPath, videos);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const stat = await fs.stat(fullPath);
          const content = await fs.readFile(fullPath, 'utf-8');
          
          // Skip if not a YouTube transcript
          const isTranscript = await isYouTubeTranscript(fullPath, content);
          if (!isTranscript) continue;
          
          // Extract YouTube URL
          const youtubeMatch = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if (!youtubeMatch) continue;
          
          const videoId = youtubeMatch[1];
          
          // Extract title — look for explicit title patterns first
          let title = null;
          
          // Pattern 1: # Title or ## Title at start
          const titleMatch = content.match(/^#{1,2}\s+(.+)$/m);
          if (titleMatch) title = titleMatch[1].trim();
          
          // Pattern 2: Title: or title = field
          if (!title) {
            const fieldMatch = content.match(/(?:^|\n)(?:title|video title)\s*[:=]\s*["']?([^"'\n]+)/i);
            if (fieldMatch) title = fieldMatch[1].trim();
          }
          
          // Pattern 3: YouTube title format in first 200 chars
          if (!title) {
            const firstLines = content.slice(0, 200);
            const youtubeTitleMatch = firstLines.match(/^([A-Z][^.!?]{10,100})[.!?]/);
            if (youtubeTitleMatch) title = youtubeTitleMatch[1].trim();
          }
          
          // Fallback
          if (!title || title.length < 5) {
            title = entry.name.replace('.md', '').replace(/-/g, ' ');
          }
          
          // Extract channel
          let channel = 'Unknown';
          const channelMatch = content.match(/(?:channel|by|channel:)\s*[:=]?\s*["']?([^"'\n]{2,50})/i);
          if (channelMatch) channel = channelMatch[1].trim();
          
          // Extract duration if present
          let duration = null;
          const durationMatch = content.match(/duration\s*[:=]?\s*(\d+:\d{2}(?::\d{2})?)/i);
          if (durationMatch) duration = durationMatch[1];
          
          videos.push({
            id: `yt-${videoId}`,
            title,
            channel,
            videoId,
            duration,
            sourceFile: entry.name,
            filePath: fullPath,
            date: stat.mtime.toISOString(),
            size: stat.size,
            hasTranscript: content.length > 1000,
            hasAnalysis: content.includes('Summary') || content.includes('Key points') || content.includes('Insights') || content.includes('Analysis'),
            isTranscript: true
          });
          
        } catch (e) {
          // Skip unreadable files
        }
      }
    }
  } catch (e) {
    // Directory doesn't exist
  }
}

async function generateYouTubeIndex() {
  console.log('Scanning YouTube content...');
  
  const videos = [];
  await scanYouTubeFiles(INBOX_DIR, videos);
  await scanYouTubeFiles(YOUTUBE_DIR, videos);
  
  // Deduplicate by video ID
  const byVideoId = {};
  videos.forEach(v => {
    if (!byVideoId[v.id]) {
      byVideoId[v.id] = v;
    }
  });
  
  const uniqueVideos = Object.values(byVideoId).sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const output = {
    generated: new Date().toISOString(),
    stats: {
      totalVideos: uniqueVideos.length,
      withTranscript: uniqueVideos.filter(v => v.hasTranscript).length,
      withAnalysis: uniqueVideos.filter(v => v.hasAnalysis).length
    },
    videos: uniqueVideos
  };
  
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log(`✓ Generated YouTube index`);
  console.log(`  Videos: ${output.stats.totalVideos}`);
  console.log(`  With transcript: ${output.stats.withTranscript}`);
  console.log(`  With analysis: ${output.stats.withAnalysis}`);
  console.log(`\n✓ Written to ${OUTPUT_FILE}`);
  
  if (uniqueVideos.length === 0) {
    console.log('\n  Note: No YouTube transcripts found. Add .md files with YouTube video IDs to inbox/youtube/ or projects/youtube-ingestion/');
  }
}

generateYouTubeIndex().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
