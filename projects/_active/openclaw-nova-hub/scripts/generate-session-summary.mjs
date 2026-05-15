#!/usr/bin/env node
/**
 * Session Aggregation Script
 * Generates summaries of stale/idle sessions for Nova Hub display
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const OUTPUT_FILE = join(PUBLIC_DIR, 'session-summary.json');

// Threshold for "stale" sessions in hours
const STALE_THRESHOLD_HOURS = 24;

function getSessionSummary() {
  try {
    // Get sessions list from OpenClaw (text mode - faster than --json)
    const output = execSync('openclaw sessions', { 
      encoding: 'utf8',
      timeout: 15000 
    });
    
    const lines = output.split('\n').filter(line => 
      line.trim().startsWith('direct') || line.trim().startsWith('group')
    );
    
    const sessions = [];
    
    for (const line of lines) {
      // Format: direct agent:main:cron:...abc  5h ago    kimi-k2.6:cloud 18k/256k (7%)
      // or: group  agent:main:whats...6@g.us  10h ago   kimi-k2.6:cloud unknown/256k (?%)
      // Regex matches: kind + agent:main:... + age + "ago" + model
      const match = line.match(/^(direct|group)\s+(agent:main:\S+)\s+(\d+[mh])\s+ago\s+(\S+)/);
      if (!match) continue;
      
      const [, kind, key, age, model] = match;
      
      // Parse age (e.g., "1h", "30m", "7h")
      const ageMatch = age.match(/(\d+)([mh])/);
      let ageHours = 0;
      if (ageMatch) {
        const value = parseInt(ageMatch[1]);
        const unit = ageMatch[2];
        ageHours = unit === 'h' ? value : value / 60;
      }
      
      sessions.push({
        kind,
        key: key.replace('agent:main:', ''),
        age,
        ageHours,
        model,
        isStale: ageHours >= STALE_THRESHOLD_HOURS,
        isIdle: ageHours >= 1 && ageHours < STALE_THRESHOLD_HOURS
      });
    }
    
    const activeCount = sessions.filter(s => !s.isStale && !s.isIdle).length;
    const idleCount = sessions.filter(s => s.isIdle).length;
    const staleCount = sessions.filter(s => s.isStale).length;
    
    const staleSessions = sessions
      .filter(s => s.isStale)
      .slice(0, 10)
      .map(s => ({ key: s.key, age: s.age, model: s.model }));
    
    const idleSessions = sessions
      .filter(s => s.isIdle)
      .slice(0, 5)
      .map(s => ({ key: s.key, age: s.age, model: s.model }));
    
    return {
      timestamp: new Date().toISOString(),
      total: sessions.length,
      active: activeCount,
      idle: idleCount,
      stale: staleCount,
      idleSessions,
      staleSessions,
      summary: `${activeCount} active · ${idleCount} idle · ${staleCount} stale`,
      needsAttention: staleCount > 10
    };
    
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      error: error.message,
      total: 0,
      active: 0,
      idle: 0,
      stale: 0,
      staleSessions: [],
      idleSessions: [],
      summary: 'OpenClaw unavailable',
      needsAttention: true
    };
  }
}

// Generate and write
const summary = getSessionSummary();
writeFileSync(OUTPUT_FILE, JSON.stringify(summary, null, 2));

console.log(`Session summary written to ${OUTPUT_FILE}`);
console.log(`Total: ${summary.total}, Active: ${summary.active}, Idle: ${summary.idle}, Stale: ${summary.stale}`);