import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SessionSummaryWidget from './SessionSummaryWidget.jsx';
import QuickActions from './QuickActions.jsx';

const POLL_MS = 5000;

export default function SystemsTelemetrySidebar({ isOpen, onClose }) {
  const [now, setNow] = useState(new Date());
  const [pulseData, setPulseData] = useState(Array(20).fill(0.5));
  const [systemStatus, setSystemStatus] = useState(null);
  const [openclawStatus, setOpenclawStatus] = useState(null);
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseData(prev => {
        const next = [...prev.slice(1), 0.3 + Math.random() * 0.7];
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/system-status.json?ts=' + Date.now());
        if (!res.ok) return;
        const data = await res.json();
        setSystemStatus(data);
      } catch {
        // silent fallback
      }
    };
    fetchStatus();
    const id = setInterval(fetchStatus, POLL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchOpenclaw = async () => {
      try {
        const res = await fetch('/openclaw-status.json?ts=' + Date.now());
        if (!res.ok) return;
        const data = await res.json();
        setOpenclawStatus(data);
      } catch {
        // silent fallback
      }
    };
    fetchOpenclaw();
    const id = setInterval(fetchOpenclaw, POLL_MS);
    return () => clearInterval(id);
  }, []);

  // Determine WhatsApp status from OpenClaw runtime
  const getWhatsAppStatus = () => {
    if (!openclawStatus?.sessions?.analysis) return { status: 'warning', detail: 'checking...' };
    const whatsappCount = openclawStatus.sessions.analysis.byType?.whatsapp || 0;
    if (whatsappCount > 0) return { status: 'online', detail: `${whatsappCount} session${whatsappCount !== 1 ? 's' : ''}` };
    return { status: 'offline', detail: 'no sessions' };
  };

  const whatsappStatus = getWhatsAppStatus();
  
  const systems = [
    { name: 'WhatsApp', ...whatsappStatus },
    { name: 'System Bridge', status: openclawStatus?.gateway?.online ? 'online' : 'warning', detail: openclawStatus?.gateway?.online ? 'connected' : 'checking...' },
    { name: 'Models', status: openclawStatus?.models?.healthy ? 'online' : 'warning', detail: openclawStatus?.models?.healthy ? 'ready' : 'degraded' },
  ];

  const getAutomationEntries = () => {
    const cronJobs = (openclawStatus?.cron?.jobs || []).map(job => ({
      kind: 'scheduled',
      name: job.name,
      detail: job.schedule.length > 15 ? job.schedule.slice(0, 15) + '…' : job.schedule,
      meta: job.last || '—',
      status: job.status === 'ok' ? 'success' : job.status === 'running' ? 'running' : 'idle'
    }));

    const live = [];
    const active = openclawStatus?.automation?.liveRuntime?.activeSessions || 0;
    const recent = openclawStatus?.automation?.liveRuntime?.recentSessions || 0;
    if (active > 0) {
      live.push({
        kind: 'live',
        name: 'Live sessions',
        detail: `${active} active`,
        meta: 'runtime',
        status: 'running'
      });
    } else if (recent > 0) {
      live.push({
        kind: 'live',
        name: 'Recent runtime',
        detail: `${recent} recent`,
        meta: 'runtime',
        status: 'idle'
      });
    }

    const surfaces = (openclawStatus?.automation?.availableSurfaces || []).slice(0, 2).map(name => ({
      kind: 'surface',
      name,
      detail: 'available',
      meta: 'surface',
      status: 'idle'
    }));

    return [...live, ...cronJobs, ...surfaces].slice(0, 6);
  };

  const automationEntries = getAutomationEntries();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 z-50"
          >
            <div className="h-full glass border-l border-white/10 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-l from-emerald-500/10 to-transparent">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${openclawStatus?.overall?.healthy ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Systems
                  </span>
                </div>
                <button 
                  onClick={onClose}
                  className="text-nova-400 hover:text-nova-200 transition-colors text-lg"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Live Pulse */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-nova-400">Neural Pulse</span>
                    <span className="text-[10px] font-mono text-emerald-400">{now.toLocaleTimeString()}</span>
                  </div>                  <div className="h-12 flex items-end gap-0.5">
                    {pulseData.map((val, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-sm"
                        style={{
                          background: `linear-gradient(to top, rgba(6,182,212,${val * 0.5}), rgba(6,182,212,${val}))`,
                          height: `${val * 100}%`,
                        }}
                        animate={{ height: `${val * 100}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Connected Surfaces */}
                <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
                  <div className="px-3 py-2 bg-white/5">
                    <span className="text-[11px] font-medium text-nova-100">Connected Surfaces</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {systems.map(sys => (
                      <div key={sys.name} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <StatusDot status={sys.status} />
                          <span className="text-xs text-nova-200">{sys.name}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-nova-500">{sys.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Summary Widget */}
                <SessionSummaryWidget />

                {/* Quick Actions */}
                <QuickActions compact={true} />

                {/* Automation Truth */}
                <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
                  <div className="px-3 py-2 bg-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-nova-100">Automation Truth</span>
                    <span className="text-[10px] text-nova-400">{openclawStatus?.automation?.summary || 'checking...'}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {automationEntries.map((entry) => (
                      <div key={`${entry.kind}-${entry.name}`} className="px-3 py-2.5 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-nova-200">{entry.name}</span>
                          <JobStatus status={entry.status} />
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-nova-500">
                          <span>{entry.detail}</span>
                          <span>{entry.meta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Mac Stats */}
                {systemStatus && (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-cyan-400 mb-2">Mac Telemetry</div>
                    <div className="space-y-2">
                      <StatBar label="CPU" value={systemStatus.cpu.percent} max={100} colorClass={systemStatus.cpu.percent > 80 ? 'bg-red-400' : systemStatus.cpu.percent > 50 ? 'bg-amber-400' : 'bg-cyan-400'} />
                      <StatBar label="RAM" value={systemStatus.memory.percent} max={100} colorClass={systemStatus.memory.percent > 90 ? 'bg-red-400' : systemStatus.memory.percent > 70 ? 'bg-amber-400' : 'bg-cyan-400'} />
                      <StatBar label="Disk" value={systemStatus.disk.percent} max={100} colorClass={systemStatus.disk.percent > 85 ? 'bg-red-400' : systemStatus.disk.percent > 60 ? 'bg-amber-400' : 'bg-cyan-400'} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-nova-300/70">
                      <div>RAM: {systemStatus.memory.usedGB}/{systemStatus.memory.totalGB} GB</div>
                      <div>Free disk: {systemStatus.disk.avail}</div>
                    </div>
                  </div>
                )}

                {/* OpenClaw Runtime - Enhanced */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400">OpenClaw Runtime</span>
                    {openclawStatus?.version && (
                      <span className="text-[9px] text-nova-500">v{openclawStatus.version}</span>
                    )}
                  </div>
                  <RuntimeBridge status={openclawStatus} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatusDot({ status }) {
  const colors = {
    online: 'bg-emerald-400',
    offline: 'bg-red-400',
    warning: 'bg-amber-400',
  };
  
  return (
    <div className={`w-1.5 h-1.5 rounded-full ${colors[status] || 'bg-nova-400'} ${status === 'online' ? 'animate-pulse' : ''}`} />
  );
}

function JobStatus({ status }) {
  const icons = {
    success: '✓',
    failed: '✗',
    running: '◌',
    idle: '−',
  };
  
  const colors = {
    success: 'text-emerald-400',
    failed: 'text-red-400',
    running: 'text-amber-400',
    idle: 'text-nova-500',
  };
  
  return (
    <span className={`text-xs ${colors[status] || 'text-nova-400'}`}>
      {icons[status] || '?'}
    </span>
  );
}

function StatBar({ label, value, max, colorClass = 'bg-cyan-400' }) {
  const pct = (value / max) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-nova-400 w-14">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-nova-300 w-10 text-right">{value}</span>
    </div>
  );
}

function formatAge(ms) {
  if (!ms) return '—';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

function RuntimeBridge({ status }) {
  if (!status) {
    return <div className="text-[10px] text-nova-300/50">Loading runtime…</div>;
  }

  const items = [
    { 
      label: 'Gateway', 
      ok: status.gateway?.online, 
      detail: status.gateway?.online ? 'Connected' : 'Offline',
      sub: status.gateway?.online ? null : 'Check service status'
    },
    { 
      label: 'Models', 
      ok: status.models?.healthy, 
      detail: shortLabel(status.models?.summary),
      sub: status.models?.primary ? `Primary: ${shortModelName(status.models.primary)}` : null
    },
    { 
      label: 'Sessions', 
      ok: status.sessions?.ok, 
      detail: shortLabel(status.sessions?.summary),
      sub: status.sessions?.analysis ? 
        `${status.sessions.analysis.active} active · ${status.sessions.analysis.idle} idle` : null
    },
    { 
      label: 'Cron', 
      ok: status.cron?.ok, 
      detail: shortLabel(status.cron?.summary),
      sub: status.cron?.stats ? 
        `${status.cron.stats.running} running · ${status.cron.stats.failed} failed` : null
    },
    { 
      label: 'Tasks', 
      ok: !status.tasks?.needsAttention, 
      detail: shortLabel(status.tasks?.summary),
      sub: status.tasks?.needsAttention ? 'Requires attention' : null
    },
  ];

  return (
    <div className="space-y-2">
      {items.map(({ label, ok, detail, sub }) => (
        <div key={label} className="flex flex-col gap-1 rounded-lg bg-black/10 px-2 py-2">
          <div className="flex items-start justify-between gap-3 text-[10px]">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`mt-0.5 inline-block w-2 h-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-nova-100">{label}</span>
            </div>
            <div className="text-right text-nova-300/70 max-w-[150px] truncate">{detail}</div>
          </div>
          {sub && (
            <div className="pl-4 text-[9px] text-nova-500/80 truncate">{sub}</div>
          )}
        </div>
      ))}
      
      {/* Session model distribution */}
      {status.sessions?.analysis?.byModel && Object.keys(status.sessions.analysis.byModel).length > 0 && (
        <div className="pt-2 border-t border-white/10">
          <div className="text-[9px] text-nova-400 mb-1.5">Session Models</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(status.sessions.analysis.byModel)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([model, count]) => (
                <span key={model} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-nova-300">
                  {shortModelName(model)} · {count}
                </span>
              ))}
          </div>
        </div>
      )}
      
      {/* Timestamp */}
      {status.timestamp && (
        <div className="pt-2 border-t border-white/10 text-[9px] text-nova-500/60 text-right">
          Updated {formatAge(Date.now() - new Date(status.timestamp).getTime())}
        </div>
      )}
    </div>
  );
}

function shortLabel(text) {
  if (!text) return '—';
  return String(text)
    .replace('Service: ', '')
    .replace('Primary: ', '')
    .replace('visible sessions', 'sessions')
    .replace('cron jobs', 'jobs')
    .replace('Task health unavailable', 'unavailable')
    .replace('Session list unavailable', 'unavailable')
    .replace('Model probe failed', 'probe failed')
    .replace('No primary model configured', 'no primary')
    .slice(0, 30);
}

function shortModelName(model) {
  if (!model) return '?';
  return model
    .replace('ollama/', '')
    .replace('openai-codex/', '')
    .replace('google-gemini-cli/', '')
    .replace(':cloud', '')
    .slice(0, 15);
}
