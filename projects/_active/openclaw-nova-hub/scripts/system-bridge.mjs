#!/usr/bin/env node
// System Health Bridge for Nova Hub
// Polls Mac system stats and writes to public/system-status.json

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public');
const OUT_FILE = join(OUT_DIR, 'system-status.json');

function getCpuLoad() {
  try {
    // Get 1-min load average
    const loadavg = execSync('uptime | awk -F "load averages:" \'{print $2}\' | awk \'{print $1}\'', { encoding: 'utf-8', timeout: 5000 }).trim();
    const load = parseFloat(loadavg.replace(',', '.'));
    // Get CPU core count for percentage calc
    const cores = parseInt(execSync('sysctl -n hw.ncpu', { encoding: 'utf-8', timeout: 2000 }).trim(), 10);
    const percent = Math.round((load / cores) * 100);
    return { load, cores, percent: Math.min(percent, 100) };
  } catch (e) {
    return { load: 0, cores: 1, percent: 0, error: e.message };
  }
}

function getMemoryStats() {
  try {
    // vm_stat output parsing
    const vmStat = execSync('vm_stat', { encoding: 'utf-8', timeout: 5000 });
    const lines = vmStat.split('\n');
    
    let pageSize = 4096; // Default 4KB pages
    let freePages = 0, activePages = 0, inactivePages = 0, wiredPages = 0;
    
    lines.forEach(line => {
      if (line.includes('page size of')) {
        const match = line.match(/page size of (\d+) bytes/);
        if (match) pageSize = parseInt(match[1], 10);
      }
      if (line.includes('Pages free:')) {
        const match = line.match(/Pages free:\s+(\d+)/);
        if (match) freePages = parseInt(match[1], 10);
      }
      if (line.includes('Pages active:')) {
        const match = line.match(/Pages active:\s+(\d+)/);
        if (match) activePages = parseInt(match[1], 10);
      }
      if (line.includes('Pages inactive:')) {
        const match = line.match(/Pages inactive:\s+(\d+)/);
        if (match) inactivePages = parseInt(match[1], 10);
      }
      if (line.includes('Pages wired down:')) {
        const match = line.match(/Pages wired down:\s+(\d+)/);
        if (match) wiredPages = parseInt(match[1], 10);
      }
    });
    
    const usedPages = activePages + inactivePages + wiredPages;
    const totalPages = freePages + usedPages;
    const totalGB = (totalPages * pageSize) / (1024 ** 3);
    const usedGB = (usedPages * pageSize) / (1024 ** 3);
    const freeGB = (freePages * pageSize) / (1024 ** 3);
    const percent = Math.round((usedPages / totalPages) * 100);
    
    return { totalGB: Math.round(totalGB * 10) / 10, usedGB: Math.round(usedGB * 10) / 10, freeGB: Math.round(freeGB * 10) / 10, percent };
  } catch (e) {
    return { totalGB: 0, usedGB: 0, freeGB: 0, percent: 0, error: e.message };
  }
}

function getDiskStats() {
  try {
    const df = execSync('df -h / | tail -1', { encoding: 'utf-8', timeout: 5000 }).trim();
    const parts = df.split(/\s+/);
    // Format: Filesystem Size Used Avail Capacity Mounted
    const size = parts[1];
    const used = parts[2];
    const avail = parts[3];
    const capacity = parts[4]; // e.g. "72%"
    const percent = parseInt(capacity.replace('%', ''), 10);
    
    return { size, used, avail, percent };
  } catch (e) {
    return { size: '0G', used: '0G', avail: '0G', percent: 0, error: e.message };
  }
}

function getUptime() {
  try {
    const up = execSync('uptime | awk \'{print $3,$4}\' | sed \'s/,//\'', { encoding: 'utf-8', timeout: 2000 }).trim();
    return up;
  } catch (e) {
    return 'unknown';
  }
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  
  const status = {
    timestamp: new Date().toISOString(),
    cpu: getCpuLoad(),
    memory: getMemoryStats(),
    disk: getDiskStats(),
    uptime: getUptime()
  };
  
  writeFileSync(OUT_FILE, JSON.stringify(status, null, 2));
  console.log(`[system-bridge] CPU ${status.cpu.percent}% · RAM ${status.memory.percent}% · Disk ${status.disk.percent}% → ${OUT_FILE}`);
}

main();
