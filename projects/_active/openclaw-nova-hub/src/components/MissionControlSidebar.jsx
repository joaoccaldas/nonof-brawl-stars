import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MissionControlSidebar({ isOpen, onClose, onNavigate, activeView, projects = [], queueItems = [] }) {
  const [expandedSection, setExpandedSection] = useState('active');
  
  // Filter projects
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in-progress');
  const modifiedToday = projects.filter(p => p.modifiedToday);
  const hasDashboard = projects.filter(p => p.hasDashboard || p.hasWorld);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 z-50"
          >
            <div className="h-full glass border-r border-white/10 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-synapse-cyan/10 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-synapse-cyan animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-synapse-cyan">
                    Mission Control
                  </span>
                </div>
                <button 
                  onClick={onClose}
                  className="text-nova-400 hover:text-nova-200 transition-colors text-lg"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Navigation */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-nova-400 mb-3">Navigation</div>
                  <div className="space-y-1">
                    {[
                      { id: 'nexus', label: 'Nexus', icon: '✦', shortcut: 'N' },
                      { id: 'home', label: 'Home / Command', icon: '⌘', shortcut: '1' },
                      { id: 'explorer', label: 'Explorer', icon: '◈', shortcut: 'E' },
                      { id: 'knowledge', label: 'Knowledge', icon: '◉', shortcut: 'K' },
                      { id: 'codebase', label: 'Codebase', icon: '⚛', shortcut: 'C' },
                      { id: 'people', label: 'People', icon: '◊', shortcut: 'P' },
                      { id: 'archive', label: 'Archive', icon: '◐', shortcut: 'A' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors group ${
                        activeView === item.id ? 'bg-synapse-cyan/20' : 'hover:bg-white/10'
                      }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-synapse-cyan/60 group-hover:text-synapse-cyan">{item.icon}</span>
                          <span className="text-sm text-nova-200 group-hover:text-nova-100">{item.label}</span>
                        </div>
                        <span className="text-[10px] text-nova-400 font-mono">⌘{item.shortcut}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Queue Section */}
                {queueItems.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-amber-400 mb-2">Next Actions</div>
                    <div className="space-y-2">
                      {queueItems.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-amber-500 font-mono">{i + 1}.</span>
                          <span className="text-nova-200">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modified Today */}
                {modifiedToday.length > 0 && (
                  <Section 
                    title="Modified Today" 
                    count={modifiedToday.length}
                    isExpanded={expandedSection === 'today'}
                    onToggle={() => toggleSection('today')}
                    accent="emerald"
                  >
                    {modifiedToday.map(p => (
                      <ProjectItem key={p.id} project={p} />
                    ))}
                  </Section>
                )}

                {/* Active Missions */}
                <Section 
                  title="Active Missions" 
                  count={activeProjects.length}
                  isExpanded={expandedSection === 'active'}
                  onToggle={() => toggleSection('active')}
                  accent="cyan"
                >
                  {activeProjects.map(p => (
                    <ProjectItem key={p.id} project={p} showProgress />
                  ))}
                </Section>

                {/* Quick Launch */}
                <Section 
                  title="Quick Launch" 
                  isExpanded={expandedSection === 'launch'}
                  onToggle={() => toggleSection('launch')}
                  accent="violet"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {hasDashboard.slice(0, 4).map(p => (
                      <button
                        key={p.id}
                        className="text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ background: p.domainColor }}
                          />
                          <span className="text-xs text-nova-200 group-hover:text-nova-100 truncate">
                            {p.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </Section>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/10 text-[10px] text-nova-400">
                {projects.length} projects · {activeProjects.length} active
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, count, isExpanded, onToggle, accent, children }) {
  const accentColors = {
    cyan: 'border-synapse-cyan/20 bg-synapse-cyan/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    violet: 'border-violet-500/20 bg-violet-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
  };

  return (
    <div className={`rounded-xl border ${accentColors[accent]} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
      >
        <span className="text-xs font-medium text-nova-100">{title}</span>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-nova-300">
              {count}
            </span>
          )}
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            className="text-nova-400 text-xs"
          >
            ›
          </motion.span>
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 pb-3 space-y-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectItem({ project, showProgress }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
      <span 
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: project.domainColor, boxShadow: `0 0 8px ${project.domainColor}` }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-nova-200 group-hover:text-nova-100 truncate">
          {project.name}
        </div>
        {showProgress && project.progress !== undefined && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${project.progress}%`,
                  background: project.domainColor 
                }}
              />
            </div>
            <span className="text-[10px] text-nova-400">{Math.round(project.progress)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
