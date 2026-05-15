import { useEffect, useState } from 'react';

const POLL_MS = 5000;

export default function SystemStatus() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/system-status.json?ts=' + Date.now());
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
    return (
      <div className="glass rounded-2xl px-4 py-3 text-rose-300 text-xs">
        System bridge offline: {error}
      </div>
    );
  }

  if (!status) {
    return (
      <div className="glass rounded-2xl px-4 py-3 text-nova-200/50 text-xs animate-pulse">
        Loading system stats…
      </div>
    );
  }

  const cpuColor = status.cpu.percent > 80 ? '#ff6b6b' : status.cpu.percent > 50 ? '#ffb547' : '#8cff66';
  const ramColor = status.memory.percent > 90 ? '#ff6b6b' : status.memory.percent > 70 ? '#ffb547' : '#8cff66';
  const diskColor = status.disk.percent > 85 ? '#ff6b6b' : status.disk.percent > 60 ? '#ffb547' : '#8cff66';

  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/60">Mac Status</div>
        <div className="text-[10px] text-nova-200/40">{status.uptime}</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="CPU" value={status.cpu.percent} color={cpuColor} suffix="%" />
        <Stat label="RAM" value={status.memory.percent} color={ramColor} suffix="%" 
              detail={`${status.memory.usedGB}/${status.memory.totalGB} GB`} />
        <Stat label="Disk" value={status.disk.percent} color={diskColor} suffix="%"
              detail={status.disk.avail + " free"} />
      </div>
    </div>
  );
}

function Stat({ label, value, color, suffix, detail }) {
  return (
    <div className="relative">
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-display font-semibold text-nova-50 tabular-nums">
          {value}
        </span>
        <span className="text-xs text-nova-200/50">{suffix}</span>
      </div>
      <div className="text-[10px] text-nova-200/60 uppercase tracking-wide">{label}</div>
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
        style={{ 
          background: `linear-gradient(90deg, ${color}40, ${color}, ${color}40)`,
          opacity: 0.8
        }}
      />
      {detail && (
        <div className="mt-1 text-[9px] text-nova-200/40 tabular-nums">{detail}</div>
      )}
    </div>
  );
}
