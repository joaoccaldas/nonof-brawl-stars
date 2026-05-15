import { motion, AnimatePresence } from 'framer-motion';

export default function EntityModal({ entity, isOpen, onClose }) {
  if (!isOpen || !entity) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg glass rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 text-xs font-medium uppercase tracking-widest text-synapse-cyan bg-synapse-cyan/10 rounded-full">
                {entity.type || 'Entity'}
              </span>
              <button
                onClick={onClose}
                className="text-nova-200/50 hover:text-nova-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <h2 className="text-3xl font-bold text-nova-50 mb-2">{entity.name}</h2>
            
            {entity.mention_count !== undefined && (
              <div className="text-sm text-nova-200/60">
                Mentioned <span className="text-nova-50 font-medium">{entity.mention_count}</span> times
              </div>
            )}
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {entity.first_mentioned && (
              <div>
                <h3 className="text-xs font-semibold text-nova-200/40 uppercase tracking-wider mb-2">First Mentioned</h3>
                <div className="text-nova-100">{entity.first_mentioned}</div>
              </div>
            )}
            
            {entity.last_mentioned && (
              <div>
                <h3 className="text-xs font-semibold text-nova-200/40 uppercase tracking-wider mb-2">Last Mentioned</h3>
                <div className="text-nova-100">{entity.last_mentioned}</div>
              </div>
            )}
            
            {entity.source_file && (
              <div>
                <h3 className="text-xs font-semibold text-nova-200/40 uppercase tracking-wider mb-2">Source Reference</h3>
                <div className="text-xs font-mono text-nova-100 break-all bg-black/20 p-3 rounded-lg border border-white/[0.05]">
                  {entity.source_file}
                </div>
              </div>
            )}
            
            {entity.confidence !== undefined && (
              <div>
                <h3 className="text-xs font-semibold text-nova-200/40 uppercase tracking-wider mb-2">Confidence Score</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-synapse-cyan/60 rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(0, entity.confidence * 100))}%` }} 
                    />
                  </div>
                  <span className="text-xs text-nova-200/60 font-mono">
                    {(entity.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/[0.06] bg-black/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-nova-50 text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
