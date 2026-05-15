export default function ActiveMissionsPanel({ projects, compact = false }) {
  const modifiedToday = (projects || []).filter((p) => p.modifiedToday);
  const prioritized = modifiedToday
    .slice()
    .sort((a, b) => {
      const pa = a.priority === 'high' ? 0 : a.priority === 'medium' ? 1 : 2;
      const pb = b.priority === 'high' ? 0 : b.priority === 'medium' ? 1 : 2;
      if (pa !== pb) return pa - pb;
      return new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0);
    })
    .slice(0, 6);

  if (compact) {
    return (
      <section className="rounded-3xl border border-white/8 bg-black/15 p-5 md:p-6 mt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-nova-200/45">Mission spine</div>
            <h3 className="mt-2 text-lg md:text-xl font-display font-semibold text-nova-50">
              A tighter pickup lane for today’s live work.
            </h3>
          </div>
          <div className="text-xs text-nova-200/45">{prioritized.length} live</div>
        </div>

        {prioritized.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-nova-200/60">
            No live missions detected for today.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {prioritized.slice(0, 4).map((project, idx) => (
              <div key={project.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-nova-200/45">
                      <span>{String(idx + 1).padStart(2, '0')}</span>
                      <span>•</span>
                      <span>{project.domain}</span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-nova-50 truncate">{project.name}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-nova-200/45">{project.priority || 'medium'}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-nova-200/40 mb-1">Focus</div>
                    <div className="text-nova-100/75">{project.currentFocus || 'No extracted focus yet.'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-nova-200/40 mb-1">Next</div>
                    <div className="text-nova-100/75">{project.nextStep || 'No next step extracted yet.'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="glass rounded-3xl p-5 md:p-6 mt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-nova-200/60">Active missions</div>
          <h3 className="mt-2 text-xl md:text-2xl font-display font-semibold text-nova-50">
            Projects touched today, ready for pickup.
          </h3>
        </div>
        <div className="text-xs text-nova-200/60">{prioritized.length} surfaced</div>
      </div>

      {prioritized.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-nova-200/70">
          No projects modified today were detected in the current scan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
          {prioritized.map((project) => (
            <div key={project.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: project.domainColor, boxShadow: `0 0 10px ${project.domainColor}` }} />
                  <div className="text-sm font-medium text-nova-50 truncate">{project.name}</div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-nova-200/50">{project.priority}</span>
              </div>

              <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-nova-200/50">Current focus</div>
              <div className="mt-1 text-sm text-nova-100/85">{project.currentFocus || 'No current focus extracted yet.'}</div>

              <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-nova-200/50">Next step</div>
              <div className="mt-1 text-sm text-nova-100/85">{project.nextStep || 'No next step extracted yet.'}</div>

              <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-nova-200/65">
                {project.hasQueue && <span className="px-2 py-1 rounded-full border border-white/10 bg-black/20">queue</span>}
                {project.hasProjectState && <span className="px-2 py-1 rounded-full border border-white/10 bg-black/20">state</span>}
                {project.subDashboards?.length > 0 && <span className="px-2 py-1 rounded-full border border-white/10 bg-black/20">{project.subDashboards.length} dash</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
