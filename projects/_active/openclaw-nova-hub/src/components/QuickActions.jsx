import { useState } from 'react';
import { motion } from 'framer-motion';

const ACTIONS = [
  {
    id: 'restart-gateway',
    label: 'Restart Gateway',
    icon: '⟳',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    confirm: true,
    cmd: 'openclaw gateway restart'
  },
  {
    id: 'kill-stuck',
    label: 'Kill Stuck Tasks',
    icon: '✕',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    confirm: true,
    cmd: 'openclaw tasks maintenance --apply'
  },
  {
    id: 'run-heartbeat',
    label: 'Run Heartbeat',
    icon: '♥',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
    confirm: false,
    cmd: 'echo HEARTBEAT_OK'
  },
  {
    id: 'refresh-models',
    label: 'Refresh Models',
    icon: '🧠',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
    confirm: false,
    cmd: 'openclaw models status --probe --json'
  },
  {
    id: 'nova-rebuild',
    label: 'Rebuild Nova Hub',
    icon: '🚀',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    confirm: true,
    cmd: 'cd ~/.openclaw/workspace/projects/_active/openclaw-nova-hub && npm run build'
  }
];

export default function QuickActions({ compact = false }) {
  const [confirming, setConfirming] = useState(null);
  const [running, setRunning] = useState(null);
  const [results, setResults] = useState({});

  const handleAction = async (action) => {
    if (action.confirm && confirming !== action.id) {
      setConfirming(action.id);
      return;
    }

    setConfirming(null);
    setRunning(action.id);
    
    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: action.cmd, id: action.id })
      });
      
      const data = await res.json();
      setResults(prev => ({ ...prev, [action.id]: { success: data.ok, message: data.output || data.error } }));
    } catch (e) {
      setResults(prev => ({ ...prev, [action.id]: { success: false, message: e.message } }));
    }
    
    setRunning(null);
    
    // Clear result after 5s
    setTimeout(() => {
      setResults(prev => {
        const next = { ...prev };
        delete next[action.id];
        return next;
      });
    }, 5000);
  };

  const displayActions = compact ? ACTIONS.slice(0, 3) : ACTIONS;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wider text-white/50 uppercase">Quick Actions</h3>
        {Object.keys(results).length > 0 && (
          <span className="text-[10px] text-white/30">tap to dismiss</span>
        )}
      </div>
      
      <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {displayActions.map(action => {
          const isConfirming = confirming === action.id;
          const isRunning = running === action.id;
          const result = results[action.id];
          
          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction(action)}
              className={`
                relative p-3 rounded-xl border transition-all duration-200
                ${action.bg} ${action.border} hover:bg-white/5
                ${isRunning ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
              `}
            >
              {isRunning && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                </div>
              )}
              
              {result && (
                <div className={`absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-sm ${result.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <span className="text-[10px] font-medium text-center px-1">{result.success ? '✓' : '✕'}</span>
                </div>
              )}
              
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{action.icon}</span>
                <span className={`text-[10px] font-medium ${action.color} text-center leading-tight`}>
                  {isConfirming ? 'Confirm?' : action.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {!compact && (
        <p className="text-[10px] text-white/20 text-center mt-1">
          Actions run server-side via bridge. Dangerous ops require confirmation.
        </p>
      )}
    </div>
  );
}
