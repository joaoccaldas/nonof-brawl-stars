function pct(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function statusTone(status) {
  switch (status) {
    case 'online':
      return 'text-emerald-300 border-emerald-400/20 bg-emerald-500/10';
    case 'prototype':
      return 'text-amber-200 border-amber-400/20 bg-amber-500/10';
    case 'offline':
      return 'text-red-200 border-red-400/20 bg-red-500/10';
    default:
      return 'text-nova-200 border-white/10 bg-white/[0.04]';
  }
}

export default function NovaCorePanel({ novaState, projects }) {
  const state = novaState?.nova || {};
  const systems = novaState?.systems || {};
  const activeProject = projects?.find((p) => p.slug === state.focus || p.id === state.focus);

  return (
    <section className="glass rounded-3xl p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-nova-200/60">Nova core</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-display font-semibold text-nova-50">
            System presence, not just project status.
          </h2>
          <p className="mt-2 text-sm text-nova-200/70 max-w-2xl">
            This panel tracks what Nova is doing, what she is focused on, and which systems are alive right now.
          </p>
        </div>
        <div className="rounded-2xl px-3 py-2 border border-synapse-cyan/20 bg-synapse-cyan/10 text-synapse-cyan text-xs uppercase tracking-[0.22em]">
          {state.state || 'idle'}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-4 mt-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Metric label="Mood" value={state.mood || 'unknown'} />
            <Metric label="Confidence" value={pct(state.confidence)} />
            <Metric label="Focus" value={state.focus || 'none'} />
            <Metric label="Thread" value={state.activeThread || 'none'} mono />
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/50 mb-1">Last observation</div>
              <div className="text-nova-100/85">{state.lastObservation || 'No observation recorded yet.'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/50 mb-1">Last action</div>
              <div className="text-nova-100/85">{state.lastAction || 'No action recorded yet.'}</div>
            </div>
            {activeProject && (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/50">Active project context</div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: activeProject.domainColor, boxShadow: `0 0 10px ${activeProject.domainColor}` }}
                  />
                  <span className="text-nova-50 font-medium">{activeProject.name}</span>
                </div>
                <div className="mt-2 text-xs text-nova-200/70">{activeProject.oneLiner}</div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/50 mb-3">System links</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(systems).map(([key, value]) => (
              <div key={key} className={`rounded-xl border px-3 py-3 ${statusTone(value)}`}>
                <div className="text-[10px] uppercase tracking-[0.22em] opacity-70">{key}</div>
                <div className="mt-1 text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/50 mb-2">Open loops</div>
            <ul className="space-y-2 text-sm text-nova-100/85">
              {(state.openLoops || []).map((loop) => (
                <li key={loop} className="rounded-xl bg-black/20 border border-white/5 px-3 py-2">
                  {loop}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, mono = false }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/50">{label}</div>
      <div className={`mt-1 text-base text-nova-50 ${mono ? 'font-mono text-sm break-all' : 'font-medium'}`}>
        {value}
      </div>
    </div>
  );
}
