#!/usr/bin/env node
/**
 * watch.mjs — re-runs scanners whenever workspace files change.
 * Debounced. Zero deps.
 * 
 * Watches:
 * - projects/ tree → scan.mjs (projects list)
 * - memory/*.md → scan-knowledge-pipeline.mjs (knowledge graph)
 */

import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HUB_ROOT = path.resolve(__dirname, '..');
const PROJECTS_ROOT = path.resolve(HUB_ROOT, '..');
const MEMORY_DIR = path.join(PROJECTS_ROOT, 'memory');

const SCAN_PROJECTS = path.join(__dirname, 'scan.mjs');
const SCAN_KNOWLEDGE = path.join(__dirname, 'scan-knowledge-pipeline.mjs');

const IGNORE_RE = /(^|\/)\.(git|DS_Store|openclaw|clawhub)|node_modules|openclaw-nova-hub/;

// Track running state per scanner
const state = {
  projects: { running: false, pending: false },
  knowledge: { running: false, pending: false },
};

function runScanner(name, scriptPath, reason = 'manual') {
  const s = state[name];
  if (s.running) {
    s.pending = true;
    return;
  }
  s.running = true;
  const started = Date.now();
  const child = spawn(process.execPath, [scriptPath], { stdio: 'inherit' });
  child.on('exit', (code) => {
    s.running = false;
    const ms = Date.now() - started;
    if (code !== 0) console.error(`[watch:${name}] failed (code ${code}) · ${reason} · ${ms}ms`);
    else console.log(`[watch:${name}] ok · ${reason} · ${ms}ms`);
    if (s.pending) {
      s.pending = false;
      runScanner(name, scriptPath, 'pending');
    }
  });
}

function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Project scanner triggers on any workspace change except memory files
const triggerProjects = debounce((p) => {
  // Skip if it's a memory file (handled separately)
  if (p.includes('/memory/') || p.startsWith('memory/')) return;
  runScanner('projects', SCAN_PROJECTS, `fs:${path.relative(PROJECTS_ROOT, p)}`);
}, 600);

// Knowledge scanner triggers only on memory .md files
const triggerKnowledge = debounce((p) => {
  runScanner('knowledge', SCAN_KNOWLEDGE, `fs:${path.relative(PROJECTS_ROOT, p)}`);
}, 800);

console.log(`[watch] watching ${PROJECTS_ROOT}`);
runScanner('projects', SCAN_PROJECTS, 'startup');
runScanner('knowledge', SCAN_KNOWLEDGE, 'startup');

// Recursive watch on workspace root
try {
  watch(PROJECTS_ROOT, { recursive: true }, (event, filename) => {
    if (!filename) return;
    const full = path.join(PROJECTS_ROOT, filename);
    if (IGNORE_RE.test(full)) return;
    
    // Route to appropriate scanner
    if (full.startsWith(MEMORY_DIR) && filename.endsWith('.md')) {
      triggerKnowledge(filename);
    } else {
      triggerProjects(filename);
    }
  });
} catch (err) {
  console.warn('[watch] recursive watch unavailable, falling back to polling.');
  setInterval(() => runScanner('projects', SCAN_PROJECTS, 'poll'), 15_000);
  setInterval(() => runScanner('knowledge', SCAN_KNOWLEDGE, 'poll'), 60_000);
}

// Safety net polling
setInterval(() => runScanner('projects', SCAN_PROJECTS, 'safety-poll'), 60_000);
setInterval(() => runScanner('knowledge', SCAN_KNOWLEDGE, 'safety-poll'), 120_000);

console.log('[watch] ready — projects:600ms debounce, knowledge:800ms debounce');
