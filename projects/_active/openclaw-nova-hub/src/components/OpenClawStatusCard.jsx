import { useEffect, useState } from 'react';

const POLL_MS = 5000;

export default function OpenClawStatusCard() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/openclaw-status.json?ts=' + Date.now());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        setStatus(data);
        setError(null);
      } catch (e) {
        setError(e.message);
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, POLL_MS);
    return () => clearInterval(id);
  }, []);

  if (error) {
    return <div className="text-xs text-rose-300">OpenClaw bridge offline: {error}</div>;
  }

  if (!status) {
    return <div className="text-xs text-nova-300/50 animate-pulse">Loading OpenClaw state…</div>;
  }

  const items = [
    { label: 'Gateway', ok: status.gateway.online, detail: status.gateway.summary },
    { label: 'Models', ok: status.models.healthy, detail: status.models.summary },
    { label: 'Sessions', ok: status.sessions.ok, detail: status.sessions.summary },
    { label: 'Cron', ok: status.cron.ok, detail: status.cron.summary },
    { label: 'Tasks', ok: !status.tasks.needsAttention, detail: status.tasks.summary },
  ];

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-wider text-emerald-400">OpenClaw Runtime</div>
        <div className={`text-[10px] ${status.overall.healthy ? 'text-emerald-300' : 'text-amber-300'}`}>
          {status.overall.summary}
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`mt-0.5 inline-block w-2 h-2 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-nova-100">{item.label}</span>
            </div>
            <div className="text-right text-nova-300/70 max-w-[170px] truncate">{item.detail}</div>
          </div>
        ))}
      </div>
      {status.models.primary && (
        <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-nova-300/60">
          Primary model: {status.models.primary}
        </div>
      )}
    </div>
  );
}
