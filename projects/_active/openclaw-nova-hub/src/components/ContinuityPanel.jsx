import { useEffect, useState } from 'react';

const POLL_MS = 5000;

const MODE_ICONS = {
  idle: '⏸️',
  acting: '⚡',
  waiting_on_user: '👤',
  waiting_on_tool: '🔧',
  blocked: '⛔',
  delivered: '✓'
};

const MODE_LABELS = {
  idle: 'Idle',
  acting: 'Acting',
  waiting_on_user: 'Waiting on you',
  waiting_on_tool: 'Waiting on tool',
  blocked: 'Blocked',
  delivered: 'Delivered'
};

const SEVERITY_COLORS = {
  high: 'text-rose-400',
  medium: 'text-amber-400',
  low: 'text-emerald-400',
  normal: 'text-nova-300'
};

const STALE_COLORS = {
  low: 'text-emerald-300',
  medium: 'text-amber-300',
  high: 'text-rose-400'
};

export default function ContinuityPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/continuity-status.json?ts=' + Date.now());
        if (!res.ok) return;
        const json = await res.json();
        setData(json);
      } catch {
        // silent fallback
      }
    };
    fetchStatus();
    const id = setInterval(fetchStatus, POLL_MS);
    return () => clearInterval(id);
  }, []);

  if (!data) {
    return <div className="glass rounded-2xl p-4 text-sm text-nova-300/50">Loading continuity…</div>;
  }

  const mode = data.status?.mode || 'idle';
  const staleRisk = data.status?.staleRisk || 'medium';
  const hasDrift = data.driftSignals?.length > 0;
  const hasActiveSessions = data.runtime?.activeSessions?.length > 0;

  return (
    <div className="glass rounded-2xl p-4 border border-fuchsia-500/20 bg-fuchsia-500/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{MODE_ICONS[mode] || '◉'}</div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-fuchsia-300/70">Continuity</div>
            <div className="text-lg font-display font-semibold text-nova-50 mt-0.5">{data.status.summary}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-[11px] uppercase tracking-widest font-medium ${MODE_COLORS[mode] || 'text-nova-300'}`}>
            {MODE_LABELS[mode] || mode}
          </div>
          <div className={`text-[10px] mt-1 ${STALE_COLORS[staleRisk]}`}>
            stale risk: {staleRisk}
          </div>
          {data.runtime?.gatewayOnline === false && (
            <div className="text-[10px] text-rose-400 mt-0.5">⚠ gateway offline</div>
          )}
        </div>
      </div>

      {/* Active Sessions (if any) */}
      {hasActiveSessions && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/60 mb-2">Active Sessions</div>
          <div className="flex flex-wrap gap-2">
            {data.runtime.activeSessions.map((s, idx) => (
              <SessionBadge key={idx} session={s} />
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <Column 
          title="Doing now" 
          items={data.doingNow} 
          waitingOn={data.waitingOn}
          empty="No active work recorded" 
        />
        <Column 
          title="Just completed" 
          items={data.lastCompleted} 
          empty="No recent completions" 
        />
        <Column 
          title="Next" 
          items={data.nextRecommended} 
          empty="No next steps recorded" 
        />
      </div>

      {/* Drift Signals (if any) - Compact aggregated view */}
      {hasDrift && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
          <div className="text-[10px] uppercase tracking-[0.2em] text-rose-300/70 mb-2">Drift Signals</div>
          <div className="space-y-1">
            {data.driftSignals.map((signal, idx) => (
              <div key={idx} className={`text-xs flex items-start gap-2 ${
                typeof signal === 'object' && signal.severity 
                  ? SEVERITY_COLORS[signal.severity] || 'text-rose-200/80'
                  : 'text-rose-200/80'
              }`}>
                <span className="text-rose-400">⚠</span>
                <span>{typeof signal === 'object' ? signal.summary : signal}</span>
              </div>
            ))}
          </div>
          {/* Session Graveyard Summary */}
          {data.runtime?.staleSummary && (
            <div className="mt-3 pt-3 border-t border-rose-500/10">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-nova-300/50">Idle sessions:</span>
                <span className="text-rose-200/70 font-medium">{data.runtime.staleSummary.total} total</span>
                <span className="text-nova-300/30">·</span>
                <span className="text-rose-200/50">{data.runtime.staleSummary.buckets.join(', ')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session Graveyard (if no drift signals but has stale sessions) */}
      {!hasDrift && data.runtime?.staleSummary && data.runtime.staleSummary.total > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/60 mb-2">Session State</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-400">◷</span>
            <span className="text-amber-200/70">{data.runtime.staleSummary.total} idle sessions</span>
            <span className="text-nova-300/40 text-[10px]">({data.runtime.staleSummary.buckets.join(', ')})</span>
          </div>
        </div>
      )}

      {/* Footer notes */}
      {data.notes && data.notes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="text-[9px] text-nova-300/40 space-y-0.5">
            {data.notes.slice(0, 1).map((note, idx) => (
              <div key={idx}>• {note}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionBadge({ session }) {
  const typeColors = {
    subagent: 'bg-violet-500/20 text-violet-200 border-violet-500/30',
    cron: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    direct: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
  };

  return (
    <div className={`px-2 py-1 rounded-md text-[10px] border ${typeColors[session.type] || typeColors.direct}`}>
      <span className="font-medium">{session.id}</span>
      <span className="opacity-70 ml-1">· {session.age}</span>
    </div>
  );
}

const MODE_COLORS = {
  idle: 'text-nova-300/60',
  acting: 'text-emerald-300',
  waiting_on_user: 'text-amber-300',
  waiting_on_tool: 'text-cyan-300',
  blocked: 'text-rose-400',
  delivered: 'text-emerald-300'
};

function Column({ title, items, waitingOn, empty }) {
  const hasWaitingOn = waitingOn && waitingOn.length > 0;
  
  return (
    <div className="rounded-xl bg-black/10 p-3 border border-white/5">
      <div className="text-[10px] uppercase tracking-[0.2em] text-nova-300/55 mb-2">{title}</div>
      
      {items?.length ? (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="text-nova-100/80 leading-snug">• {item}</div>
          ))}
        </div>
      ) : hasWaitingOn ? (
        <div className="space-y-2">
          {waitingOn.slice(0, 3).map((wait, idx) => (
            <div key={idx} className={`flex items-start gap-2 leading-snug ${SEVERITY_COLORS[wait.severity] || 'text-nova-100/80'}`}>
              <span className="opacity-60 text-[10px] mt-0.5">
                {wait.type === 'user' ? '👤' : 
                 wait.type === 'subagent' ? '🤖' : 
                 wait.type === 'system' ? '⚙️' : '•'}
              </span>
              <span>{wait.summary}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-nova-300/40">{empty}</div>
      )}
    </div>
  );
}
