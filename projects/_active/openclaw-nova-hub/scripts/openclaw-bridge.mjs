#!/usr/bin/env node
// OpenClaw Health Bridge for Nova Hub
// Polls OpenClaw runtime health and writes to public/openclaw-status.json

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public');
const OUT_FILE = join(OUT_DIR, 'openclaw-status.json');

function run(command, timeout = 8000) {
  try {
    return {
      ok: true,
      output: execSync(command, { encoding: 'utf-8', timeout, stdio: ['pipe', 'pipe', 'pipe'] }).trim()
    };
  } catch (e) {
    return {
      ok: false,
      error: e.message,
      output: e.stdout?.toString?.().trim?.() || ''
    };
  }
}

function getGatewayStatus() {
  const res = run('openclaw gateway status');
  const text = res.output || res.error || '';
  const online = res.ok && !/stopped|not running|error/i.test(text);
  const summary = online 
    ? (text.match(/Runtime:\s*(\w+)/)?.[1] === 'running' ? 'Gateway running' : 'Gateway online')
    : 'Gateway unavailable';
  return {
    online,
    summary,
    raw: text
  };
}

function extractPrimaryModel(parsed) {
  // Try multiple paths to find the primary model
  return parsed?.agents?.defaults?.model?.primary 
    || parsed?.defaultModel
    || parsed?.resolvedDefault
    || parsed?.primary
    || null;
}

function extractAuthSummary(auth) {
  if (!auth) return null;
  
  const profiles = auth.providers || [];
  const usable = profiles.reduce((acc, p) => {
    const oauthProfiles = p.profiles?.oauth || 0;
    const apiKeyProfiles = p.profiles?.apiKey || 0;
    const tokenProfiles = p.profiles?.token || 0;
    return acc + oauthProfiles + apiKeyProfiles + tokenProfiles;
  }, 0);
  
  const unusable = (auth.unusableProfiles || []).length;
  const oauthProviders = (auth.oauth?.providers || [])
    .filter(p => p.status === 'ok')
    .map(p => p.provider);
  
  return {
    usable,
    unusable,
    oauthProviders,
    hasIssues: unusable > 0
  };
}

function getModelStatus() {
  const res = run('openclaw models status --json', 10000);

  if (!res.ok) {
    return {
      ok: false,
      healthy: false,
      summary: 'Model status unavailable',
      raw: res.error
    };
  }

  try {
    const parsed = JSON.parse(res.output);
    const primary = extractPrimaryModel(parsed);
    const authSummary = extractAuthSummary(parsed?.auth);
    
    // Health: needs a primary model AND working auth
    const hasPrimary = Boolean(primary);
    const hasWorkingAuth = authSummary ? authSummary.usable > 0 : true;
    const hasAuthIssues = authSummary?.hasIssues || false;
    
    const healthy = hasPrimary && hasWorkingAuth && !hasAuthIssues;
    
    let summary;
    if (!hasPrimary) {
      summary = 'No primary model configured';
    } else if (hasAuthIssues) {
      summary = `${primary} (auth issues)`;
    } else {
      const authCount = authSummary?.usable || 0;
      summary = authCount > 0 
        ? `${primary} · ${authCount} auth profile${authCount !== 1 ? 's' : ''}`
        : primary;
    }
    
    return {
      ok: true,
      healthy,
      primary,
      summary,
      raw: parsed,
      authSummary
    };
  } catch (e) {
    return {
      ok: true,
      healthy: false,
      summary: 'Model status parse error',
      raw: res.output
    };
  }
}

function analyzeSessions(sessions) {
  const now = Date.now();
  const items = Array.isArray(sessions) ? sessions : [];
  
  const active = items.filter(s => s.ageMs < 5 * 60 * 1000).length; // < 5 min
  const recent = items.filter(s => s.ageMs < 15 * 60 * 1000).length; // < 15 min
  const idle = items.filter(s => s.ageMs >= 15 * 60 * 1000).length; // >= 15 min
  
  // Count by type
  const byType = items.reduce((acc, s) => {
    const key = s.key || '';
    let type = 'other';
    if (key.includes(':whatsapp:')) type = 'whatsapp';
    else if (key.includes(':subagent:')) type = 'subagent';
    else if (key.includes(':cron:')) type = 'cron';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  // Count by model
  const byModel = items.reduce((acc, s) => {
    const model = s.model || 'unknown';
    acc[model] = (acc[model] || 0) + 1;
    return acc;
  }, {});
  
  // Most active session
  const mostRecent = items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
  
  return {
    total: items.length,
    active,
    recent,
    idle,
    byType,
    byModel,
    mostRecent: mostRecent ? {
      model: mostRecent.model,
      ageMs: mostRecent.ageMs,
      key: mostRecent.key?.split(':').pop()?.slice(0, 20)
    } : null
  };
}

function getSessions() {
  const commands = [
    'openclaw sessions --json',
    'openclaw sessions list --json'
  ];

  let res = null;
  for (const command of commands) {
    const attempt = run(command, 6000);
    if (attempt.ok) {
      res = attempt;
      break;
    }
    if (!res) res = attempt;
  }

  if (!res?.ok) {
    return {
      ok: false,
      count: 0,
      summary: 'Session list unavailable',
      raw: res?.output || res?.error || ''
    };
  }

  try {
    const parsed = JSON.parse(res.output);
    const items = Array.isArray(parsed)
      ? parsed
      : parsed?.sessions || parsed?.items || [];
    const analysis = analyzeSessions(items);

    let summary;
    if (analysis.active > 0) {
      summary = `${analysis.total} sessions · ${analysis.active} active now`;
    } else if (analysis.recent > 0) {
      summary = `${analysis.total} sessions · ${analysis.recent} recent`;
    } else {
      summary = `${analysis.total} sessions · ${analysis.idle} idle`;
    }

    return {
      ok: true,
      count: analysis.total,
      summary,
      analysis,
      raw: items
    };
  } catch {
    const lines = (res.output || '').split('\n').filter(Boolean);
    return {
      ok: true,
      count: lines.length,
      summary: `${lines.length} sessions`,
      raw: res.output
    };
  }
}

function parseCronJobs(output) {
  const lines = (output || '').split('\n').filter(l => l.trim());
  const jobs = [];
  
  for (const line of lines) {
    // Skip header
    if (line.includes('ID') && line.includes('Name')) continue;
    if (line.includes('─')) continue;
    
    // Try to parse tabular format
    const parts = line.trim().split(/\s{2,}/);
    if (parts.length >= 4) {
      const [id, name, schedule, next, last, status, target] = parts;
      if (id && id.length === 36) { // UUID-like
        jobs.push({
          id: id.slice(0, 8),
          name: name?.slice(0, 25) || 'unnamed',
          schedule: schedule?.slice(0, 20) || '-',
          next: next || '-',
          last: last || '-',
          status: status || 'unknown',
          target: target || '-'
        });
      }
    }
  }
  
  return jobs;
}

function getCronStatus() {
  const res = run('openclaw cron list');
  const jobs = parseCronJobs(res.output);
  
  const ok = res.ok;
  const running = jobs.filter(j => j.status === 'ok' || j.status === 'running').length;
  const idle = jobs.filter(j => j.status === 'idle').length;
  const failed = jobs.filter(j => j.status === 'failed').length;
  
  let summary;
  if (!ok) {
    summary = 'Cron list unavailable';
  } else if (failed > 0) {
    summary = `${jobs.length} jobs · ${failed} failed`;
  } else if (running > 0) {
    summary = `${jobs.length} jobs · ${running} running`;
  } else {
    summary = `${jobs.length} jobs · ${idle} idle`;
  }
  
  return {
    ok,
    count: jobs.length,
    summary,
    jobs: jobs.slice(0, 5), // First 5 jobs for display
    stats: { running, idle, failed },
    raw: res.output
  };
}

function getTaskHealth() {
  // Try maintenance first, then audit
  const commands = [
    { cmd: 'openclaw tasks maintenance --json', timeout: 12000 },
    { cmd: 'openclaw tasks audit --json', timeout: 12000 },
    { cmd: 'openclaw tasks list --json', timeout: 8000 }
  ];
  
  for (const { cmd, timeout } of commands) {
    const res = run(cmd, timeout);
    if (res.ok) {
      const text = res.output || '';
      try {
        const parsed = JSON.parse(text);
        const needsAttention = /stuck|failed|repair|lost|timed_out|error/i.test(JSON.stringify(parsed));
        return {
          ok: true,
          summary: parsed?.summary || 'Tasks healthy',
          raw: parsed,
          needsAttention,
          source: cmd.split(' ')[2] // maintenance/audit/list
        };
      } catch {
        const needsAttention = /stuck|failed|repair|lost|timed_out|error/i.test(text);
        return {
          ok: true,
          summary: text.split('\n')[0] || 'Tasks checked',
          raw: text,
          needsAttention,
          source: cmd.split(' ')[2]
        };
      }
    }
  }
  
  return {
    ok: false,
    summary: 'Task health unavailable',
    raw: '',
    needsAttention: false
  };
}

function formatDuration(ms) {
  if (!ms) return 'unknown';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const timestamp = new Date().toISOString();
  const gateway = getGatewayStatus();
  const models = getModelStatus();
  const sessions = getSessions();
  const cron = getCronStatus();
  const tasks = getTaskHealth();

  // Build overall summary with clean status
  const parts = [];
  if (gateway.online) parts.push('gateway ok');
  else parts.push('gateway down');
  
  if (models.healthy) parts.push('models ok');
  else if (!models.primary) parts.push('no primary model');
  else if (models.authSummary?.hasIssues) parts.push('auth issues');
  else parts.push('models degraded');
  
  if (tasks.needsAttention) parts.push('tasks need attention');
  else parts.push('tasks ok');

  const liveRuntime = {
    activeSessions: sessions.analysis?.active || 0,
    recentSessions: sessions.analysis?.recent || 0,
    sessionTypes: sessions.analysis?.byType || {},
    hasActiveRuntime: (sessions.analysis?.active || 0) > 0,
    hasRecentRuntime: (sessions.analysis?.recent || 0) > 0,
    queueAttention: tasks.needsAttention,
    summary:
      (sessions.analysis?.active || 0) > 0
        ? `${sessions.analysis.active} active session${sessions.analysis.active !== 1 ? 's' : ''}`
        : (sessions.analysis?.recent || 0) > 0
        ? `${sessions.analysis.recent} recent session${sessions.analysis.recent !== 1 ? 's' : ''}`
        : 'no live runtime detected'
  };

  const automation = {
    scheduledCount: cron.count || 0,
    scheduledHealthy: cron.ok,
    liveRuntime,
    availableSurfaces: [
      'cron jobs',
      'heartbeat supervision',
      'task maintenance',
      'bridge scripts',
      'session orchestration'
    ],
    summary:
      (cron.count || 0) > 0
        ? `${cron.count} scheduled, ${liveRuntime.summary}`
        : `0 scheduled, ${liveRuntime.summary}`
  };

  const status = {
    version: '2.1-runtime-truth',
    timestamp,
    gateway,
    models,
    sessions,
    cron,
    tasks,
    automation,
    overall: {
      healthy: Boolean(gateway.online && models.healthy && !tasks.needsAttention),
      summary: parts.join(' · ')
    }
  };

  writeFileSync(OUT_FILE, JSON.stringify(status, null, 2));
  console.log(`[openclaw-bridge] ${status.overall.summary} → ${OUT_FILE}`);
}

main();
