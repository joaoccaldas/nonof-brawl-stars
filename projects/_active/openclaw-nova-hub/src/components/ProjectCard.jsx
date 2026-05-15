import { motion } from 'framer-motion';
import { timeAgo, truncate } from '../lib/format.js';

export default function ProjectCard({ project, selected, onSelect }) {
  const subCount = project.subDashboards?.length ?? 0;
  return (
    <motion.button
      layout
      onClick={() => onSelect?.(project)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative text-left rounded-2xl glass glass-hover p-5 transition-colors duration-200 ${
        selected ? 'ring-1 ring-nova-300/60 shadow-glow' : ''
      }`}
    >
      {/* Domain accent bar */}
      <div
        className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full"
        style={{ background: project.domainColor, boxShadow: `0 0 12px ${project.domainColor}` }}
      />

      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: project.statusColor,
                boxShadow: `0 0 10px ${project.statusColor}`
              }}
            />
            <span className="text-[10px] uppercase tracking-[0.18em] text-nova-200/60">
              {project.domain} · {project.status}
            </span>
          </div>
          <div className="mt-1.5 text-[15px] font-semibold text-nova-50 font-display truncate">
            {project.name}
          </div>
        </div>
        {project.priority && (
          <span
            className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
              project.priority === 'high'
                ? 'border-synapse-amber/50 text-synapse-amber'
                : project.priority === 'low'
                ? 'border-white/10 text-nova-200/50'
                : 'border-white/15 text-nova-200/70'
            }`}
          >
            {project.priority}
          </span>
        )}
      </div>

      {project.oneLiner && (
        <p className="pl-2 mt-3 text-[13px] leading-snug text-nova-100/80 line-clamp-3">
          {truncate(project.oneLiner.replace(/^[-*\s]+/, ''), 200)}
        </p>
      )}

      <div className="pl-2 mt-4 flex items-center gap-3 text-[11px] text-nova-200/55">
        <span>{timeAgo(project.lastUpdated)}</span>
        {project.currentFocus && (
          <>
            <span className="opacity-30">·</span>
            <span className="truncate max-w-[150px]">{truncate(project.currentFocus, 28)}</span>
          </>
        )}
        {!project.currentFocus && subCount > 0 && (
          <>
            <span className="opacity-30">·</span>
            <span className="text-synapse-cyan">{subCount} dash</span>
          </>
        )}
      </div>

      {project.nextStep && (
        <div className="pl-2 mt-3 text-[11px] text-nova-100/55 line-clamp-1">
          Next: {truncate(project.nextStep, 60)}
        </div>
      )}
    </motion.button>
  );
}
