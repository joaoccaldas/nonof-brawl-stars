export default function AvatarBridgePanel({ projects }) {
  const avatarProject = (projects || []).find((p) => p.slug === 'nova-avatar');
  const architecturePresent = Boolean(avatarProject?.hasReadme);
  const statePresent = Boolean(avatarProject?.hasProjectState);
  const runtimePresent = (avatarProject?.subDashboards || []).some((d) => d.type === 'godot');

  return (
    <section className="glass rounded-3xl p-5 md:p-6 mt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-nova-200/60">Avatar bridge</div>
          <h3 className="mt-2 text-xl md:text-2xl font-display font-semibold text-nova-50">
            Embodiment link into Nova Avatar.
          </h3>
          <p className="mt-2 text-sm text-nova-200/70 max-w-2xl">
            The dashboard is the command surface. The Godot world is the embodiment layer. This panel keeps that bridge explicit and auditable.
          </p>
        </div>
        <div className="text-xs text-nova-200/60">file-sync first</div>
      </div>

      {!avatarProject ? (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-4 text-sm text-red-100">
          `nova-avatar` project not detected in current scan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <BridgeMetric label="Godot runtime" value={runtimePresent ? 'detected' : 'missing'} good={runtimePresent} />
          <BridgeMetric label="Project state" value={statePresent ? 'detected' : 'missing'} good={statePresent} />
          <BridgeMetric label="Architecture reference" value={architecturePresent ? 'detected' : 'missing'} good={architecturePresent} />
        </div>
      )}

      {avatarProject && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/50">Security posture</div>
          <ul className="mt-2 space-y-2 text-sm text-nova-100/85">
            <li>• Keep bridge state file-safe and browser-safe, no secrets or raw personal content.</li>
            <li>• Prefer explicit JSON contracts over dynamic command execution.</li>
            <li>• Keep WebSocket/live sync out until file-based state is stable and audited.</li>
          </ul>
        </div>
      )}
    </section>
  );
}

function BridgeMetric({ label, value, good }) {
  return (
    <div className={`rounded-2xl border px-4 py-4 ${good ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-amber-400/20 bg-amber-500/10'}`}>
      <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/60">{label}</div>
      <div className={`mt-2 text-base font-medium ${good ? 'text-emerald-200' : 'text-amber-100'}`}>{value}</div>
    </div>
  );
}
