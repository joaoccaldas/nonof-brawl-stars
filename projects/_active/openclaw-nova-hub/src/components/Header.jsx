import { useEffect, useState } from 'react';
import { fmtTime, timeAgo } from '../lib/format.js';

export default function Header({ data, lastFetch }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="pt-5 pb-3 md:pt-6 md:pb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-nova-200/55">
          <span className="inline-flex w-5 h-5 rounded-md bg-gradient-to-br from-nova-400 via-nova-600 to-synapse-violet shadow-glow" />
          <span>Nova</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-nova-200/45">
          <span className="font-mono text-nova-100/70">{fmtTime(now)}</span>
          <span>scan {timeAgo(data?.generatedAt)}</span>
        </div>
      </div>
    </header>
  );
}
