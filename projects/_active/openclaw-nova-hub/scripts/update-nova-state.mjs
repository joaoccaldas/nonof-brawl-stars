#!/usr/bin/env node
// Update Nova state from conversation - called by OpenClaw
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, '../public/nova-state.json');

// Parse args (--mood focused --state building etc)
const updates = {};
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const val = args[i + 1];
    if (val && !val.startsWith('--')) {
      updates[key] = val;
      i++;
    }
  }
}

// Load existing
let state = existsSync(STATE_PATH) 
  ? JSON.parse(readFileSync(STATE_PATH, 'utf8'))
  : { nova: {}, systems: {} };

// Apply updates
if (updates.mood) state.nova.mood = updates.mood;
if (updates.state) state.nova.state = updates.state;
if (updates.focus) state.nova.focus = updates.focus;
if (updates.confidence) state.nova.confidence = parseFloat(updates.confidence);
state.timestamp = new Date().toISOString();

writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
console.log('✓ Nova state updated:', updates.mood || updates.state || 'timestamp');
