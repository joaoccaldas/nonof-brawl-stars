#!/usr/bin/env node
/**
 * generate-thumbnails.mjs — Generate thumbnails for images in media/inbound
 * Requires: sharp (npm install sharp)
 * Run: node scripts/generate-thumbnails.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Check if sharp is available
let sharp;
try {
  sharp = await import('sharp');
  sharp = sharp.default || sharp;
} catch (err) {
  console.log('⚠️  sharp not installed. Skipping thumbnail generation.');
  console.log('   To enable thumbnails: npm install sharp');
  process.exit(0);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = path.join(process.env.HOME || '/Users/joao', '.openclaw', 'media', 'inbound');
const THUMB_DIR = path.join(process.cwd(), 'public', 'thumbnails');

const THUMB_SIZE = 200; // 200x200 max

async function generateThumbnails() {
  try {
    // Ensure thumbnail directory exists
    await fs.mkdir(THUMB_DIR, { recursive: true });
    
    const entries = await fs.readdir(MEDIA_DIR, { withFileTypes: true });
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    let generated = 0;
    let skipped = 0;
    
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      
      const ext = path.extname(entry.name).toLowerCase();
      if (!imageExts.includes(ext)) continue;
      
      const sourcePath = path.join(MEDIA_DIR, entry.name);
      const thumbName = entry.name.replace(ext, '.jpg');
      const thumbPath = path.join(THUMB_DIR, thumbName);
      
      // Check if thumbnail already exists and is newer than source
      try {
        const sourceStat = await fs.stat(sourcePath);
        const thumbStat = await fs.stat(thumbPath);
        if (thumbStat.mtime >= sourceStat.mtime) {
          skipped++;
          continue;
        }
      } catch (e) {
        // Thumbnail doesn't exist, generate it
      }
      
      try {
        await sharp(sourcePath)
          .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 85, progressive: true })
          .toFile(thumbPath);
        generated++;
      } catch (err) {
        console.error(`  ✗ Failed: ${entry.name} — ${err.message}`);
      }
    }
    
    console.log(`✓ Thumbnails: ${generated} generated, ${skipped} up-to-date`);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

generateThumbnails();
