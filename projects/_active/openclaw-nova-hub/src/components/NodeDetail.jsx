import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TYPE_CONFIG = {
  project: { icon: '🚀', color: '#22d3ee', label: 'Project' },
  memory: { icon: '🧠', color: '#a855f7', label: 'Memory' },
  meeting: { icon: '👥', color: '#f472b6', label: 'Meeting' },
  task: { icon: '✓', color: '#fbbf24', label: 'Task' },
  concept: { icon: '💡', color: '#f472b6', label: 'Concept' },
  file: { icon: '📄', color: '#00d4ff', label: 'File' }
};

async function fetchNodeContent(node) {
  if (!node.path) return null;
  
  try {
    // Try to read the file content
    const response = await fetch(`/api/file?path=${encodeURIComponent(node.path)}`);
    if (response.ok) {
      return await response.text();
    }
  } catch (e) {
    // File reading not available in browser
  }
  
  return null;
}

function extractKeyInfo(content, type) {
  if (!content) return [];
  
  const info = [];
  
  // Extract headers
  const headers = content.match(/^#{1,3}\s+(.+)$/gm) || [];
  headers.slice(0, 5).forEach(h => {
    info.push({
      type: 'header',
      text: h.replace(/^#+\s+/, '')
    });
  });
  
  // Extract bullet points
  const bullets = content.match(/^[-*]\s+(.+)$/gm) || [];
  bullets.slice(0, 5).forEach(b => {
    info.push({
      type: 'bullet',
      text: b.replace(/^[-*]\s+/, '')
    });
  });
  
  // Extract dates
  const dates = content.match(/\d{4}-\d{2}-\d{2}/g) || [];
  if (dates.length > 0) {
    info.push({
      type: 'date',
      text: `Dates: ${dates.slice(0, 3).join(', ')}`
    });
  }
  
  // Extract action items for tasks
  if (type === 'task') {
    const actions = content.match(/\[\s*\]\s*(.+)/g) || [];
    actions.slice(0, 3).forEach(a => {
      info.push({
        type: 'action',
        text: a.replace(/\[\s*\]\s*/, '')
      });
    });
  }
  
  return info.slice(0, 8);
}

export default function NodeDetail({ node, onClose, relatedNodes = [] }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyInfo, setKeyInfo] = useState([]);

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      const data = await fetchNodeContent(node);
      setContent(data);
      setKeyInfo(extractKeyInfo(data, node.type));
      setLoading(false);
    }
    
    if (node.path) {
      loadContent();
    } else {
      setLoading(false);
    }
  }, [node]);

  const config = TYPE_CONFIG[node.type] || TYPE_CONFIG.concept;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="max-w-3xl w-full max-h-[90vh] rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-white/10"
          style={{ borderLeft: `4px solid ${config.color}` }}
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${config.color}20` }}
          >
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-nova-50 truncate">{node.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="text-xs px-2 py-1 rounded-full capitalize"
                style={{ 
                  backgroundColor: `${config.color}20`,
                  color: config.color 
                }}
              >
                {config.label}
              </span>
              {node.status && (
                <span className="text-xs text-nova-200/50">
                  {node.status}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-nova-200/60"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Key Info */}
          {keyInfo.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-nova-200/40 mb-3">Key Information</h3>
              <div className="space-y-2">
                {keyInfo.map((info, i) => (
                  <div 
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                  >
                    <span className="text-lg shrink-0">
                      {info.type === 'header' && '📌'}
                      {info.type === 'bullet' && '•'}
                      {info.type === 'date' && '📅'}
                      {info.type === 'action' && '☐'}
                    </span>
                    <span className="text-sm text-nova-200/80">{info.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Concepts */}
          {node.concepts?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-nova-200/40 mb-3">Related Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {node.concepts.map((concept, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Connected Entities */}
          {node.entities?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-nova-200/40 mb-3">Mentioned With</h3>
              <div className="flex flex-wrap gap-2">
                {node.entities.slice(0, 10).map((entity, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Path */}
          {node.path && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-nova-200/40 mb-2">Location</h3>
              <code className="text-xs text-nova-200/50 font-mono break-all">
                {node.path.replace(/^.*\.openclaw\//, '~/.openclaw/')}
              </code>
            </div>
          )}

          {/* Last Accessed */}
          {node.lastAccessed && (
            <div className="text-xs text-nova-200/30">
              Last modified: {new Date(node.lastAccessed).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}

          {/* No content state */}
          {!loading && !content && keyInfo.length === 0 && (
            <div className="text-center py-8 text-nova-200/40">
              <p>No detailed content available</p>
              <p className="text-xs mt-2">This {node.type} is indexed but content preview is not available</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-sm"
          >
            Close
          </button>
          {node.path && (
            <a
              href={`vscode://file${node.path}`}
              className="flex-1 py-3 rounded-xl bg-synapse-cyan/20 border border-synapse-cyan/40 text-synapse-cyan text-center text-sm hover:bg-synapse-cyan/30 transition-colors"
            >
              Open in VS Code
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
