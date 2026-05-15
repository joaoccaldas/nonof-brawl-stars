#!/usr/bin/env node
/**
 * scan-media-files.mjs — Scan ~/.openclaw/media/inbound/ and generate media-index.json
 * Run: node scripts/scan-media-files.mjs
 */

import fs from 'fs/promises';
import path from 'path';

const MEDIA_DIR = path.join(process.env.HOME || '/Users/joao', '.openclaw', 'media', 'inbound');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'media-index.json');

function getFileCategory(filename) {
  const ext = path.extname(filename).toLowerCase().slice(1);
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'].includes(ext)) return 'image';
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus'].includes(ext)) return 'audio';
  if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'].includes(ext)) return 'video';
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'json', 'csv', 'xlsx', 'pptx', 'html', 'xml'].includes(ext)) return 'document';
  return 'unknown';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function scanMediaFiles() {
  try {
    const entries = await fs.readdir(MEDIA_DIR, { withFileTypes: true });
    const files = [];
    
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      
      const filepath = path.join(MEDIA_DIR, entry.name);
      const stats = await fs.stat(filepath);
      const category = getFileCategory(entry.name);
      
      // Check if thumbnail exists
      let thumbnail = null;
      if (category === 'image') {
        const thumbPath = path.join(process.cwd(), 'public', 'thumbnails', entry.name.replace(/\.[^/.]+$/, '.jpg'));
        try {
          await fs.access(thumbPath);
          thumbnail = `/thumbnails/${entry.name.replace(/\.[^/.]+$/, '.jpg')}`;
        } catch (e) {
          // Thumbnail doesn't exist
        }
      }
      
      files.push({
        id: entry.name.replace(/\.[^/.]+$/, ''),
        name: entry.name,
        path: filepath,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        date: stats.mtime.toISOString(),
        category,
        ext: path.extname(entry.name).toLowerCase().slice(1),
        thumbnail
      });
    }
    
    // Sort by date (newest first)
    files.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const output = {
      scanned: new Date().toISOString(),
      totalFiles: files.length,
      categories: {
        image: files.filter(f => f.category === 'image').length,
        audio: files.filter(f => f.category === 'audio').length,
        video: files.filter(f => f.category === 'video').length,
        document: files.filter(f => f.category === 'document').length,
        unknown: files.filter(f => f.category === 'unknown').length
      },
      files
    };
    
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
    
    console.log(`✓ Scanned ${files.length} files`);
    console.log(`  Images: ${output.categories.image}`);
    console.log(`  Audio: ${output.categories.audio}`);
    console.log(`  Video: ${output.categories.video}`);
    console.log(`  Documents: ${output.categories.document}`);
    console.log(`  Unknown: ${output.categories.unknown}`);
    console.log(`\n✓ Written to ${OUTPUT_FILE}`);
    
  } catch (err) {
    console.error('Error scanning media files:', err.message);
    process.exit(1);
  }
}

scanMediaFiles();
