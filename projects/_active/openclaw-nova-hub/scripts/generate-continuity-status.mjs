#!/usr/bin/env node
// Generate continuity-status.json for Nova Hub
// Runtime-aware synthesis of what Nova is doing, waiting on, and what just completed.
// v2: Ingests OpenClaw bridge data for waiting-on and drift signals.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_DIR = join(ROOT, 'public');
const OUT_FILE = join(PUBLIC_DIR, 'continuity-status.json');
const QUEUE_FILE = join(ROOT, 'QUEUE.md');
const PLAN_FILE = join(ROOT, 'NEXT-ARCHITECTURE-PLAN.md');
const OPENCLAW_STATUS_FILE = join(PUBLIC_DIR, 'openclaw-status.json');

// Configurable thresholds (in ms)
const STALE_SESSION_MS = 5 * 60 * 1000;      // 5 minutes
const DRIFT_SESSION_MS = 15 * 60 * 1000;     // 15 minutes  
const LONG_TASK_MS = 10 * 60 * 1000;         // 10 minutes

function extractBullets(sectionText) {
  return String(sectionText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^- /.test(line))
    .map((line) => line.replace(/^- /, '').trim());
}

function section(text, heading) {
  const idx = text.indexOf(heading);
  if (idx === -1) return '';
  const rest = text.slice(idx + heading.length);
  const next = rest.search(/\n## |\n### /);
  return next === -1 ? rest : rest.slice(0, next);
}

function safeRead(path) {
  try {
    return existsSync(path) ? readFileSync(path, 'utf8') : '';
  } catch {
    return '';
  }
}

function safeReadJson(path) {
  try {
    const content = safeRead(path);
    return content ? JSON.parse(content) : null;
  } catch {
    return null;
  }
}

function formatDuration(ms) {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${Math.round(ms / 3600000)}h`;
}

// Analyze OpenClaw runtime data for continuity signals
function analyzeRuntime(openclawData) {
  if (!openclawData) {
    return {
      waitingOn: [],
      driftSignals: [],
      staleRisk: 'high',
      runtimeHealthy: false,
      activeSessions: [],
      recentCompletions: [],
      staleSummary: null
    };
  }

  const now = Date.now();
  const waitingOn = [];
  const driftSignals = [];
  const activeSessions = [];
  const recentCompletions = [];

  // Check gateway status
  if (!openclawData.gateway?.online) {
    waitingOn.push({
      type: 'system',
      summary: 'OpenClaw gateway offline',
      severity: 'high'
    });
    driftSignals.push('Gateway unavailable - runtime data stale');
  }

  // Analyze sessions - dedupe by sessionId
  const sessions = openclawData.sessions?.raw || [];
  const uniqueSessions = [];
  const seenIds = new Set();
  for (const s of sessions) {
    if (s.sessionId && !seenIds.has(s.sessionId)) {
      seenIds.add(s.sessionId);
      uniqueSessions.push(s);
    }
  }
  
  const activeDirectSessions = uniqueSessions.filter(s => 
    s.kind === 'direct' && s.ageMs < DRIFT_SESSION_MS
  );
  
  const staleSessions = uniqueSessions.filter(s => 
    s.ageMs > STALE_SESSION_MS && s.ageMs < DRIFT_SESSION_MS
  );
  
  const driftSessions = uniqueSessions.filter(s => 
    s.ageMs >= DRIFT_SESSION_MS
  );

  // Build active session list - only truly active (under 5 min)
  const trulyActive = activeDirectSessions.filter(s => s.ageMs < STALE_SESSION_MS);
  trulyActive.forEach(s => {
    const sessionType = s.key?.includes('subagent') ? 'subagent' : 
                       s.key?.includes('cron') ? 'cron' : 'direct';
    const isRecent = s.ageMs < 60000; // Under 1 minute
    
    activeSessions.push({
      id: s.sessionId?.slice(0, 8) || 'unknown',
      type: sessionType,
      model: s.model || 'unknown',
      age: formatDuration(s.ageMs),
      tokens: s.totalTokens || 0,
      active: isRecent
    });
  });

  // Aggregate stale sessions by time bucket instead of listing individually
  const staleSummary = aggregateStaleSessions(staleSessions, driftSessions);

  // Build drift signals from aggregated data (cleaner than listing every session)
  if (staleSummary && staleSummary.total > 0) {
    const oldest = staleSummary.oldestSessionAge ? `, oldest ${staleSummary.oldestSessionAge}` : '';
    driftSignals.push({
      type: 'stale_sessions',
      summary: `${staleSummary.total} idle sessions: ${staleSummary.buckets.join(', ')}${oldest}`,
      severity: staleSummary.total > 20 ? 'medium' : 'low'
    });
  }

  // Check for sessions waiting on user (group sessions with recent activity)
  const groupSessions = uniqueSessions.filter(s => s.kind === 'group');
  if (groupSessions.length > 0) {
    const recentGroup = groupSessions.filter(s => s.ageMs < 300000); // Under 5 min
    if (recentGroup.length > 0) {
      waitingOn.push({
        type: 'user',
        summary: `${recentGroup.length} group conversation(s) active`,
        severity: 'low'
      });
    }
  }

  // Check for current subagent work
  const subagentSessions = activeDirectSessions.filter(s => 
    s.key?.includes('subagent') && s.ageMs < 300000
  );
  if (subagentSessions.length > 0) {
    const mostRecent = subagentSessions.sort((a, b) => b.ageMs - a.ageMs)[0];
    waitingOn.push({
      type: 'subagent',
      summary: `Subagent ${mostRecent.sessionId?.slice(0, 8)} running (${mostRecent.model})`,
      severity: 'low',
      duration: formatDuration(mostRecent.ageMs)
    });
  }

  // Check cron health
  const cronJobs = openclawData.cron?.raw || '';
  const failedCrons = cronJobs.split('\n').filter(line => 
    /failed|error|stuck/i.test(line)
  );
  if (failedCrons.length > 0) {
    driftSignals.push(`${failedCrons.length} cron job(s) need attention`);
  }

  // Recent task completions (from sessions with completed markers)
  const completedSessions = uniqueSessions.filter(s => 
    s.totalTokens && s.totalTokens > 0 && s.ageMs < 3600000 // Within 1 hour
  ).slice(0, 3);
  
  completedSessions.forEach(s => {
    recentCompletions.push({
      type: s.key?.includes('subagent') ? 'subagent' : 'session',
      summary: `${s.model || 'unknown'} session completed`,
      tokens: s.totalTokens,
      time: formatDuration(s.ageMs) + ' ago'
    });
  });

  // Compute stale risk from runtime state
  let staleRisk = 'low';
  if (driftSessions.length > 0 || !openclawData.gateway?.online) {
    staleRisk = 'high';
  } else if (staleSessions.length > 0 || failedCrons.length > 0) {
    staleRisk = 'medium';
  }

  return {
    waitingOn,
    driftSignals,
    staleRisk,
    staleSummary,
    runtimeHealthy: openclawData.overall?.healthy || false,
    activeSessions: activeSessions.slice(0, 5),
    recentCompletions,
    uniqueSessionCount: uniqueSessions.length
  };
}

// Aggregate stale/drift sessions into clean summary buckets
function aggregateStaleSessions(staleSessions, driftSessions) {
  if (staleSessions.length === 0 && driftSessions.length === 0) {
    return null;
  }

  const buckets = [
    { label: '< 1h', maxMs: 60 * 60 * 1000, sessions: [] },
    { label: '< 6h', maxMs: 6 * 60 * 60 * 1000, sessions: [] },
    { label: '< 24h', maxMs: 24 * 60 * 60 * 1000, sessions: [] },
    { label: '1d+', maxMs: Infinity, sessions: [] }
  ];

  const allStale = [...staleSessions, ...driftSessions];
  
  for (const s of allStale) {
    const bucket = buckets.find(b => s.ageMs < b.maxMs);
    if (bucket) bucket.sessions.push(s);
  }

  const summary = buckets
    .filter(b => b.sessions.length > 0)
    .map(b => `${b.sessions.length} ${b.label}`);

  return {
    total: allStale.length,
    buckets: summary,
    oldestSessionAge: allStale.length > 0 
      ? formatDuration(Math.max(...allStale.map(s => s.ageMs)))
      : null
  };
}

function main() {
  mkdirSync(PUBLIC_DIR, { recursive: true });

  // Read documentation sources
  const queue = safeRead(QUEUE_FILE);
  const plan = safeRead(PLAN_FILE);

  // Read runtime data
  const openclawData = safeReadJson(OPENCLAW_STATUS_FILE);

  // Extract queue data
  const inProgressSection = section(queue, '### In progress');
  const nextTasksSection = section(queue, '## Next tasks');
  const immediateSection = section(plan, '## Immediate priority');

  const doingNow = extractBullets(inProgressSection).slice(0, 3);
  const lastCompleted = extractBullets(section(queue, '### Completed')).slice(-3).reverse();
  const nextRecommended = extractBullets(nextTasksSection).slice(0, 3);
  const architecturePriorities = extractBullets(immediateSection).slice(0, 4);

  // Analyze runtime for waiting-on and drift signals
  const runtime = analyzeRuntime(openclawData);

  // Merge docs-based and runtime-based waiting-on
  const mergedWaitingOn = [
    ...doingNow.map(task => ({
      type: 'task',
      summary: task,
      severity: 'normal'
    })),
    ...runtime.waitingOn
  ];

  // Determine primary mode from combined state
  let mode = 'idle';
  if (mergedWaitingOn.length > 0) {
    mode = 'acting';
    if (runtime.waitingOn.some(w => w.type === 'user')) {
      mode = 'waiting_on_user';
    } else if (runtime.waitingOn.some(w => w.type === 'subagent')) {
      mode = 'waiting_on_tool';
    }
  }

  // Build rich summary
  let summary = doingNow[0] || 'No active continuity task recorded';
  if (runtime.activeSessions.length > 0) {
    const active = runtime.activeSessions[0];
    summary = `${active.type} work active (${active.model}, ${active.age})`;
  }
  if (runtime.waitingOn.length > 0) {
    const wait = runtime.waitingOn[0];
    summary = `Waiting: ${wait.summary}`;
  }

  const continuity = {
    timestamp: new Date().toISOString(),
    version: '2.0-runtime-aware',
    status: {
      mode,
      staleRisk: runtime.staleRisk,
      summary,
      runtimeHealthy: runtime.runtimeHealthy
    },
    doingNow,
    waitingOn: mergedWaitingOn.slice(0, 5),
    lastCompleted: lastCompleted.length ? lastCompleted : runtime.recentCompletions.map(c => c.summary),
    nextRecommended,
    architecturePriorities,
    runtime: {
      activeSessions: runtime.activeSessions,
      recentCompletions: runtime.recentCompletions,
      sessionCount: runtime.uniqueSessionCount || 0,
      gatewayOnline: openclawData?.gateway?.online || false,
      staleSummary: runtime.staleSummary
    },
    driftSignals: runtime.driftSignals,
    notes: [
      'Continuity v2: Runtime-aware with OpenClaw bridge integration.',
      'Waiting-on synthesized from active sessions and task state.',
      'Drift signals computed from session age and cron health.',
      'Stale risk: low=healthy, medium=some idle, high=drift or offline.'
    ]
  };

  writeFileSync(OUT_FILE, JSON.stringify(continuity, null, 2));
  console.log(`[continuity] ${mode} (${runtime.staleRisk} stale risk) → ${OUT_FILE}`);
  
  if (runtime.driftSignals.length > 0) {
    const signalSummary = runtime.driftSignals.map(s => typeof s === 'object' ? s.summary : s).join('; ');
    console.log(`[continuity] drift signals: ${signalSummary}`);
  }
}

main();
