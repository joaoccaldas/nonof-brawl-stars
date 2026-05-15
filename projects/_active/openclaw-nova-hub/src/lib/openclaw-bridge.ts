/**
 * OpenClaw Runtime Bridge for Nova Hub Phase 2
 * 
 * Connects to OpenClaw's runtime to fetch live session, cron, and automation data
 * Transforms it into structured format for Nova Hub dashboard
 */

export interface RuntimeSnapshot {
  activeSessions: SessionInfo[];
  cronJobs: CronJobInfo[];
  recentTaskRuns: TaskRunInfo[];
  systemHealth: SystemHealthInfo;
  timestamp: string;
}

export interface SessionInfo {
  id: string;
  kind: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  lastActivity: string;
  status: 'active' | 'idle' | 'error';
}

export interface CronJobInfo {
  id: string;
  name: string;
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  status: 'healthy' | 'stale' | 'failed';
}

export interface TaskRunInfo {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
}

export interface SystemHealthInfo {
  modelPrimary: string;
  modelStatus: 'healthy' | 'degraded' | 'fallback';
  memorySync: 'healthy' | 'degraded';
  lastHeartbeat: string;
}

export interface ContinuitySignal {
  type: 'blocked' | 'pending' | 'decision' | 'review';
  title: string;
  description: string;
  source: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  age: string;
}

export interface AutomationSurface {
  name: string;
  type: 'mcp' | 'skill' | 'integration';
  status: 'available' | 'degraded' | 'unavailable';
  lastUsed: string | null;
  description: string;
}

/**
 * Fetch live runtime snapshot from OpenClaw
 * Queries actual OpenClaw CLI for session, cron, and system data
 */
export async function getRuntimeSnapshot(): Promise<RuntimeSnapshot> {
  const timestamp = new Date().toISOString();
  
  try {
    // Fetch sessions
    const sessions = await fetchOpenClawSessions();
    
    // Fetch cron jobs
    const cronJobs = await fetchCronJobs();
    
    // Get system health
    const systemHealth = await getSystemHealth();
    
    return {
      activeSessions: sessions,
      cronJobs: cronJobs,
      recentTaskRuns: [],
      systemHealth,
      timestamp,
    };
  } catch (error) {
    console.error('Runtime snapshot error:', error);
    return {
      activeSessions: [],
      cronJobs: [],
      recentTaskRuns: [],
      systemHealth: {
        modelPrimary: 'ollama/kimi-k2.5:cloud',
        modelStatus: 'degraded',
        memorySync: 'degraded',
        lastHeartbeat: timestamp,
      },
      timestamp,
    };
  }
}

/**
 * Fetch active sessions from OpenClaw
 */
async function fetchOpenClawSessions(): Promise<SessionInfo[]> {
  try {
    const response = await fetch('/api/sessions');
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!data.sessions) return [];
    
    return data.sessions.map((s: any) => ({
      id: s.sessionKey || s.id || 'unknown',
      kind: s.kind || s.type || 'unknown',
      model: s.model || 'unknown',
      tokensIn: s.tokensIn || s.tokens_in || 0,
      tokensOut: s.tokensOut || s.tokens_out || 0,
      lastActivity: s.lastActivity || s.last_activity || s.updatedAt || new Date().toISOString(),
      status: s.status === 'active' ? 'active' : s.status === 'error' ? 'error' : 'idle',
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch cron jobs from OpenClaw
 */
async function fetchCronJobs(): Promise<CronJobInfo[]> {
  try {
    const response = await fetch('/api/cron');
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!data.jobs) return [];
    
    return data.jobs.map((j: any) => ({
      id: j.id || j.jobId || 'unknown',
      name: j.name || 'Unnamed Job',
      schedule: j.schedule || j.cron || 'unknown',
      lastRun: j.lastRun || j.last_run || null,
      nextRun: j.nextRun || j.next_run || null,
      status: j.status === 'healthy' ? 'healthy' : j.status === 'failed' ? 'failed' : 'stale',
    }));
  } catch {
    return [];
  }
}

/**
 * Get system health info
 */
async function getSystemHealth(): Promise<SystemHealthInfo> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      return {
        modelPrimary: 'ollama/kimi-k2.5:cloud',
        modelStatus: 'degraded',
        memorySync: 'healthy',
        lastHeartbeat: new Date().toISOString(),
      };
    }
    
    const data = await response.json();
    return {
      modelPrimary: data.model?.primary || 'ollama/kimi-k2.5:cloud',
      modelStatus: data.model?.healthy ? 'healthy' : 'degraded',
      memorySync: data.memory?.healthy ? 'healthy' : 'degraded',
      lastHeartbeat: new Date().toISOString(),
    };
  } catch {
    return {
      modelPrimary: 'ollama/kimi-k2.5:cloud',
      modelStatus: 'degraded',
      memorySync: 'degraded',
      lastHeartbeat: new Date().toISOString(),
    };
  }
}

/**
 * Get continuity signals — what Nova is "waiting on"
 * Parses QUEUE.md Blocked section, PROJECT_STATE.json stalled projects
 */
export async function getContinuitySignals(): Promise<ContinuitySignal[]> {
  const signals: ContinuitySignal[] = [];
  
  try {
    // Fetch from the dashboard's existing continuity-status endpoint
    const response = await fetch('/continuity-status.json');
    if (response.ok) {
      const data = await response.json();
      
      if (data.waitingOn) {
        for (const item of data.waitingOn) {
          signals.push({
            type: item.type || 'pending',
            title: item.title || 'Untitled',
            description: item.description || '',
            source: item.source || 'unknown',
            priority: item.priority || 'medium',
            age: item.age || 'unknown',
          });
        }
      }
    }
  } catch {
    // Silent fail
  }
  
  return signals;
}

/**
 * Get available automation surfaces
 * MCPs, skills, integrations that can be invoked
 */
export async function getAutomationSurfaces(): Promise<AutomationSurface[]> {
  return [
    {
      name: 'sessions_list',
      type: 'skill',
      status: 'available',
      lastUsed: null,
      description: 'List active OpenClaw sessions',
    },
    {
      name: 'cron',
      type: 'skill',
      status: 'available',
      lastUsed: null,
      description: 'Manage scheduled automation jobs',
    },
    {
      name: 'gog',
      type: 'integration',
      status: 'available',
      lastUsed: null,
      description: 'Google Workspace (Gmail, Calendar, Drive)',
    },
    {
      name: 'memory',
      type: 'skill',
      status: 'available',
      lastUsed: null,
      description: 'Long-term memory and recall',
    },
    {
      name: 'github',
      type: 'integration',
      status: 'available',
      lastUsed: null,
      description: 'GitHub issues, PRs, and actions',
    },
  ];
}

/**
 * Aggregate stale sessions into summary view
 * Reduces noise from session graveyard
 */
export function aggregateStaleSessions(
  sessions: SessionInfo[],
  staleThresholdHours: number = 24
): { active: SessionInfo[]; stale: SessionInfo[]; summary: string } {
  const now = new Date();
  const stale = sessions.filter(s => {
    const lastActivity = new Date(s.lastActivity);
    const hoursSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    return hoursSince > staleThresholdHours;
  });
  
  const active = sessions.filter(s => !stale.includes(s));
  
  const summary = stale.length > 0
    ? `${stale.length} sessions idle >${staleThresholdHours}h`
    : 'No stale sessions';
  
  return { active, stale, summary };
}

/**
 * Format runtime snapshot for dashboard display
 */
export function formatRuntimeForDashboard(
  snapshot: RuntimeSnapshot
): { title: string; items: { label: string; value: string; status?: 'good' | 'warn' | 'error' }[] }[] {
  return [
    {
      title: 'Active Sessions',
      items: snapshot.activeSessions.slice(0, 5).map(s => ({
        label: s.id.slice(0, 8),
        value: `${s.tokensIn + s.tokensOut} tokens`,
        status: s.status === 'active' ? 'good' : s.status === 'error' ? 'error' : 'warn',
      })),
    },
    {
      title: 'Cron Jobs',
      items: snapshot.cronJobs.slice(0, 5).map(c => ({
        label: c.name.slice(0, 20),
        value: c.status,
        status: c.status === 'healthy' ? 'good' : c.status === 'failed' ? 'error' : 'warn',
      })),
    },
    {
      title: 'System Health',
      items: [
        { label: 'Model', value: snapshot.systemHealth.modelPrimary.split('/')[1] || 'unknown', status: snapshot.systemHealth.modelStatus === 'healthy' ? 'good' : 'warn' },
        { label: 'Memory', value: snapshot.systemHealth.memorySync, status: snapshot.systemHealth.memorySync === 'healthy' ? 'good' : 'warn' },
      ],
    },
  ];
}

// Export for use in Nova Hub components
export default {
  getRuntimeSnapshot,
  getContinuitySignals,
  getAutomationSurfaces,
  aggregateStaleSessions,
  formatRuntimeForDashboard,
};