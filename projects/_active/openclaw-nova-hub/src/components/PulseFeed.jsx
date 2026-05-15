import { timeAgo, truncate } from '../lib/format.js';

export default function PulseFeed({ data, novaState }) {
  const pulse = data?.pulse ?? [];
  const secondBrain = data?.secondBrain ?? [];
  const recentProjects =
    data?.projects
      ?.slice()
      .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))
      .slice(0, 6) ?? [];
  const openLoops = novaState?.nova?.openLoops ?? [];
  const systems = novaState?.systems ?? {};

  return (
    <aside className="glass rounded-3xl p-5 sticky top-6 max-h-[calc(100vh-3rem)] overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold font-display text-nova-50">Pulse</h3>
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-synapse-cyan">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-synapse-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-synapse-cyan" />
          </span>
          live
        </span>
      </div>

      {novaState && (
        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/60 mb-2">
            Nova status
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-nova-200/50">Mode</div>
                <div className="mt-1 text-sm text-nova-50">{novaState.nova?.state || 'idle'} · {novaState.nova?.mood || 'neutral'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.22em] text-nova-200/50">Focus</div>
                <div className="mt-1 text-sm text-nova-50">{novaState.nova?.focus || 'none'}</div>
              </div>
            </div>
            {openLoops.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {openLoops.slice(0, 3).map((loop) => (
                  <li key={loop} className="text-xs text-nova-100/80">
                    • {loop}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(systems).map(([key, value]) => (
                <span key={key} className="text-[10px] px-2 py-1 rounded-full border border-white/10 bg-black/20 text-nova-200/75">
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Memory pulse */}
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/60 mb-2">
          Memory stream
        </div>
        <ul className="space-y-2">
          {pulse.length === 0 && (
            <li className="text-xs text-nova-200/50">No memory entries yet.</li>
          )}
          {pulse.map((p, i) => (
            <li
              key={`${p.at}-${i}`}
              className="rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2"
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-nova-200/60">
                <span>{p.type}</span>
                <span>{p.at}</span>
              </div>
              <div className="mt-1 text-xs text-nova-100/80 line-clamp-2">
                {truncate(p.summary, 160) || p.title}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Second Brain entities */}
      {secondBrain.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/60 mb-2">
            Top entities
          </div>
          <div className="flex flex-wrap gap-1.5">
            {secondBrain.map((e, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-1 rounded-full bg-a45bff/20 text-a45bff"
              >
                {e.name} <span className="text-a45bff/60">×{e.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent project activity */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/60 mb-2">
          Recent activity
        </div>
        <ul className="space-y-1.5">
          {recentProjects.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg hover:bg-white/[0.04]"
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: p.domainColor, boxShadow: `0 0 8px ${p.domainColor}` }}
              />
              <span className="text-nova-50 truncate flex-1">{p.name}</span>
              <span className="text-nova-200/50 tabular-nums">{timeAgo(p.lastUpdated)}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
