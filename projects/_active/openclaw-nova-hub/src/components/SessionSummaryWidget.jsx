import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const POLL_MS = 15000;

export default function SessionSummaryWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/session-summary.json?ts=' + Date.now());
        if (!res.ok) return;
        const json = await res.json();
        setData(json);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const id = setInterval(fetchData, POLL_MS);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-3 animate-pulse">
        <div className="h-4 w-24 bg-white/10 rounded" />
      </div>
    );
  }

  if (!data) return null;

  const getStatusColor = (count) => {
    if (count === 0) return 'text-nova-500';
    if (count < 10) return 'text-emerald-400';
    return 'text-amber-400';
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-nova-400">Runtime Sessions</span>
        <span className="text-[10px] font-mono text-nova-500">total: {data.total}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className={`text-lg font-bold ${getStatusColor(data.active)}`}>{data.active}</div>
          <div className="text-[9px] uppercase tracking-wide text-nova-500">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-nova-300">{data.idle}</div>
          <div className="text-[9px] uppercase tracking-wide text-nova-500">Idle</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${data.stale > 0 ? 'text-red-400' : 'text-nova-500'}`}>{data.stale}</div>
          <div className="text-[9px] uppercase tracking-wide text-nova-500">Stale</div>
        </div>
      </div>
      {data.needsAttention && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <span className="text-[9px] text-amber-400">⚠ Stale sessions need attention</span>
        </div>
      )}
    </div>
  );
}