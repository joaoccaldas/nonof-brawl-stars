import { motion, AnimatePresence } from 'framer-motion';
import { prettyPath, timeAgo, truncate } from '../lib/format.js';

export default function ProjectDrawer({ project, onClose }) {
  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm z-40"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] z-50 p-4"
          >
            <div className="h-full rounded-3xl glass shadow-glow-strong flex flex-col overflow-hidden">
              {/* Header */}
              <div className="relative p-5 border-b border-white/5">
                <div
                  className="absolute inset-x-0 top-0 h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${project.domainColor}, transparent)`
                  }}
                />
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-nova-200/60 hover:text-nova-50 rounded-full w-8 h-8 grid place-items-center hover:bg-white/10"
                  aria-label="Close"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-nova-200/70">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: project.statusColor, boxShadow: `0 0 10px ${project.statusColor}` }}
                  />
                  <span>{project.domain}</span>
                  <span className="opacity-50">/</span>
                  <span>{project.status}</span>
                  {project.priority === 'high' && (
                    <span className="ml-1 text-synapse-amber">● high priority</span>
                  )}
                </div>
                <h2 className="mt-2 text-2xl font-display font-semibold leading-tight text-nova-50">
                  {project.name}
                </h2>
                {project.oneLiner && (
                  <p className="mt-2 text-sm text-nova-100/80 leading-snug">
                    {project.oneLiner.replace(/^[-*\s]+/, '')}
                  </p>
                )}
                <div className="mt-3 text-[11px] text-nova-200/60 flex items-center gap-3">
                  <span>{timeAgo(project.lastUpdated)}</span>
                  <span className="opacity-40">·</span>
                  <span>{project.fileCount} files</span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto p-5 space-y-5">
                {project.currentFocus && (
                  <Field label="Current focus" value={project.currentFocus} />
                )}
                {project.nextStep && (
                  <Field label="Next step" value={project.nextStep} accent="#8cff66" />
                )}
                {project.tags?.length > 0 && (
                  <div>
                    <FieldLabel>Tags</FieldLabel>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-nova-200/70"
                        >
                          {truncate(t.replace(/^[-*\s]+/, ''), 40)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-dashboards */}
                <div>
                  <FieldLabel>Sub-dashboards</FieldLabel>
                  {project.subDashboards?.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {project.subDashboards.map((d, i) => (
                        <li key={i}>
                          <a
                            href={`file://${d.absolute}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl glass glass-hover px-3 py-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-nova-50">
                                {d.label}
                              </span>
                              <span className="text-[10px] uppercase tracking-widest text-synapse-cyan">
                                {d.type} ↗
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-nova-200/50 mt-0.5 truncate">
                              {d.path}
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-2 text-[12px] text-nova-200/50">
                      No dedicated sub-dashboard detected for this project yet.
                    </div>
                  )}
                </div>

                {/* Paths */}
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <div className="mt-2 space-y-1.5">
                    <PathRow label="project" value={project.path} href={`file://${project.absolutePath}`} />
                    {project.hasReadme && (
                      <PathRow
                        label="readme"
                        value={prettyPath(project.readmePath)}
                        href={`file://${project.absolutePath}/README.md`}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-4 border-t border-white/5 flex items-center gap-2">
                <a
                  href={`file://${project.absolutePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 rounded-xl bg-nova-500/80 hover:bg-nova-500 text-nova-50 text-sm font-medium grid place-items-center transition-colors"
                >
                  Open folder
                </a>
                {project.subDashboards?.[0] && (
                  <a
                    href={`file://${project.subDashboards[0].absolute}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 rounded-xl bg-synapse-violet/80 hover:bg-synapse-violet text-white text-sm font-medium grid place-items-center transition-colors"
                  >
                    Launch dashboard ↗
                  </a>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function FieldLabel({ children }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.22em] text-nova-200/60">
      {children}
    </div>
  );
}

function Field({ label, value, accent }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div
        className="mt-2 rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2 text-sm text-nova-100/90 leading-snug"
        style={accent ? { borderLeft: `2px solid ${accent}` } : undefined}
      >
        {value.replace(/^[-*\s]+/, '')}
      </div>
    </div>
  );
}

function PathRow({ label, value, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-[11px] font-mono text-nova-200/70 hover:text-nova-50 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg px-2.5 py-1.5 truncate"
    >
      <span className="uppercase tracking-widest text-nova-200/50">{label}</span>
      <span className="truncate">{value}</span>
    </a>
  );
}
