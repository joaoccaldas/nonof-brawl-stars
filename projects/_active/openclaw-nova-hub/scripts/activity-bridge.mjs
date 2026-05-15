#!/usr/bin/env node
/**
 * Activity Bridge - Nova Hub Live Activity Feed Generator
 * 
 * Watches workspace for activity patterns and generates
 * public/activity-state.json for the LiveActivity component.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../..');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'activity-state.json');

// Activity tracking state
const activityState = {
  recent: [],
  operations: { active: 0, complete: 0, pending: 0, error: 0 },
  memory: { files: [], searches: 0 },
  tasks: [],
  system: { uptime: '00:00', activityLevel: 0.3, lastUpdate: Date.now() }
};

const MAX_RECENT = 50;
const startTime = Date.now();

// File patterns to watch
const WATCH_PATTERNS = {
  memory: /memory\/(\d{4}-\d{2}-\d{2})\.md$/,
  knowledge: /knowledge\/.+\.md$/,
  inbox: /inbox\/.+$/,
  projects: /projects\/[^/]+\//,
  tools: /scripts\/.+\.m?js$/,
  config: /\.(json|yaml|yml|toml)$/,
};

// Known tool operations from log patterns
const TOOL_PATTERNS = [
  { pattern: /read|cat|head|tail/, action: 'READ', type: 'file' },
  { pattern: /write|echo.*>/, action: 'WRITE', type: 'file' },
  { pattern: /edit|sed/, action: 'EDIT', type: 'file' },
  { pattern: /exec|spawn|run/, action: 'EXEC', type: 'tool' },
  { pattern: /memory_search|grep.*memory/, action: 'SEARCH', type: 'memory' },
  { pattern: /web_search|curl|fetch/, action: 'FETCH', type: 'tool' },
  { pattern: /image|vision|codex.*image/, action: 'VISION', type: 'tool' },
  { pattern: /pdf|document/, action: 'PARSE', type: 'tool' },
];

function formatUptime(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function addActivity(item) {
  activityState.recent.unshift({
    timestamp: new Date().toISOString(),
    ...item
  });
  
  if (activityState.recent.length > MAX_RECENT) {
    activityState.recent = activityState.recent.slice(0, MAX_RECENT);
  }
  
  // Update operation counts
  if (item.status) {
    activityState.operations[item.status] = (activityState.operations[item.status] || 0) + 1;
  }
  
  // Update activity level based on recent activity
  const recentCount = activityState.recent.filter(
    r => Date.now() - new Date(r.timestamp).getTime() < 60000
  ).length;
  activityState.system.activityLevel = Math.min(0.9, 0.1 + recentCount * 0.05);
}

async function scanMemoryFiles() {
  try {
    const memoryDir = path.join(ROOT_DIR, 'memory');
    const files = await fs.readdir(memoryDir).catch(() => []);
    
    const mdFiles = files
      .filter(f => f.endsWith('.md'))
      .sort((a, b) => b.localeCompare(a)) // Reverse chronological
      .slice(0, 5);
    
    activityState.memory.files = mdFiles;
    
    // Check for memory searches in today's file
    const today = new Date().toISOString().slice(0, 10);
    const todayFile = path.join(memoryDir, `${today}.md`);
    
    try {
      const content = await fs.readFile(todayFile, 'utf-8');
      const searchMatches = content.match(/memory_search/g) || [];
      activityState.memory.searches = searchMatches.length;
    } catch {
      activityState.memory.searches = 0;
    }
  } catch (err) {
    // Silent fail
  }
}

async function scanTasks() {
  try {
    const tasksDir = path.join(ROOT_DIR, 'tasks');
    const files = await fs.readdir(tasksDir).catch(() => []);
    
    // Look for active task markers
    const activeTasks = [];
    
    for (const file of files.slice(0, 10)) {
      if (!file.endsWith('.json') && !file.endsWith('.md')) continue;
      
      try {
        const content = await fs.readFile(path.join(tasksDir, file), 'utf-8');
        const hasRunning = content.includes('running') || content.includes('in_progress');
        const hasError = content.includes('error') || content.includes('failed');
        const hasComplete = content.includes('complete') || content.includes('done');
        
        if (hasRunning || hasError || hasComplete) {
          activeTasks.push({
            name: file.replace(/\.(json|md)$/, ''),
            status: hasError ? 'error' : hasRunning ? 'running' : 'complete',
            file: file
          });
        }
      } catch {
        // Skip
      }
    }
    
    activityState.tasks = activeTasks.slice(0, 5);
    
    // Update operation counts
    activityState.operations.active = activeTasks.filter(t => t.status === 'running').length;
    activityState.operations.error = activeTasks.filter(t => t.status === 'error').length;
    activityState.operations.complete = activeTasks.filter(t => t.status === 'complete').length;
  } catch (err) {
    // Silent fail
  }
}

async function simulateActivity() {
  // Simulate some realistic activity based on time patterns
  const hour = new Date().getHours();
  const isWorkHours = hour >= 8 && hour < 20;
  
  if (isWorkHours && Math.random() > 0.7) {
    const actions = [
      { action: 'memory_search', type: 'memory', path: 'memory/MIDTERM.md' },
      { action: 'read', type: 'file', path: 'knowledge/CONCEPTS.md' },
      { action: 'read', type: 'file', path: 'memory/2026-04-22.md' },
      { action: 'tool_call', type: 'tool', details: 'web_search' },
      { action: 'write', type: 'file', path: 'inbox/note.md' },
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    addActivity({
      ...action,
      status: Math.random() > 0.9 ? 'error' : 'complete'
    });
  }
}

async function writeActivityState() {
  try {
    // Ensure public directory exists
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    
    // Update system info
    activityState.system.lastUpdate = Date.now();
    activityState.system.uptime = formatUptime(Date.now() - startTime);
    
    // Write state
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(activityState, null, 2)
    );
    
    console.log(`[activity-bridge] Updated ${OUTPUT_FILE} (${activityState.recent.length} events)`);
  } catch (err) {
    console.error('[activity-bridge] Write failed:', err.message);
  }
}

async function runOnce() {
  await scanMemoryFiles();
  await scanTasks();
  await simulateActivity();
  await writeActivityState();
}

async function runWatch() {
  console.log('[activity-bridge] Starting watch mode...');
  console.log(`[activity-bridge] Monitoring: ${ROOT_DIR}`);
  console.log(`[activity-bridge] Output: ${OUTPUT_FILE}`);
  
  // Initial scan
  await runOnce();
  
  // Set up periodic refresh
  const REFRESH_INTERVAL = 2000; // 2 seconds
  
  const tick = async () => {
    await runOnce();
    setTimeout(tick, REFRESH_INTERVAL);
  };
  
  setTimeout(tick, REFRESH_INTERVAL);
  
  // Keep process alive
  process.stdin.resume();
}

// CLI
const args = process.argv.slice(2);
const isWatch = args.includes('--watch') || args.includes('-w');
const isHelp = args.includes('--help') || args.includes('-h');

if (isHelp) {
  console.log(`
Activity Bridge - Nova Hub Live Activity Feed

Usage:
  node activity-bridge.mjs [options]

Options:
  -w, --watch    Run in watch mode (updates every 2s)
  -h, --help     Show this help

Examples:
  node activity-bridge.mjs           # Single run
  node activity-bridge.mjs --watch     # Watch mode (dev)
`);
  process.exit(0);
}

if (isWatch) {
  runWatch().catch(err => {
    console.error('[activity-bridge] Fatal:', err);
    process.exit(1);
  });
} else {
  runOnce().catch(err => {
    console.error('[activity-bridge] Fatal:', err);
    process.exit(1);
  });
}
