import { motion } from 'framer-motion';

export default function IframeView({ dash, onClose }) {
  if (!dash) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col w-full h-[calc(100vh-100px)] rounded-2xl glass overflow-hidden border border-white/[0.08]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-black/40">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: dash.projectDomainColor || '#00f2fe' }}
          />
          <div>
            <h2 className="text-sm font-semibold text-nova-50 leading-none">{dash.label}</h2>
            <p className="text-[10px] text-nova-200/50 mt-1 uppercase tracking-wider">{dash.projectName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href={`/${dash.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-nova-200/60 hover:text-nova-50 text-xs font-medium transition-colors border border-white/[0.05]"
            title="Open in new tab"
          >
            Open Externally
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-nova-200/60 hover:text-red-400 transition-colors"
            title="Close Dashboard"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-black/20">
        {/* SECURITY WARNING: allow-scripts + allow-same-origin effectively disables the sandbox for same-origin content. 
            Do NOT load untrusted external URLs in this iframe. Keep this restricted to internal dashboards. */}
        <iframe
          src={`/${dash.path}`}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title={dash.label}
        />
      </div>
    </motion.div>
  );
}
