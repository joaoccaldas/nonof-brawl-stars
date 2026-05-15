import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityIcon = ({ type }) => {
  const icons = {
    file: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    memory: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    tool: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    task: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    pulse: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  };
  return icons[type] || icons.pulse;
};

const StatusIndicator = ({ status }) => {
  const colors = {
    running: 'bg-synapse-cyan',
    complete: 'bg-emerald-400',
    pending: 'bg-amber-400',
    error: 'bg-red-400',
    idle: 'bg-nova-400',
  };
  return (
    <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors[status] || colors.idle} animate-pulse`} />
  );
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = (now - date) / 1000;
  
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const truncatePath = (path, maxLen = 35) => {
  if (!path) return '';
  if (path.length <= maxLen) return path;
  const parts = path.split('/');
  if (parts.length > 2) {
    return `.../${parts.slice(-2).join('/')}`;
  }
  return `...${path.slice(-maxLen + 3)}`;
};

export default function LiveActivity({ className = '' }) {
  const [activityData, setActivityData] = useState(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/activity-state.json?t=' + Date.now());
        if (response.ok) {
          const data = await response.json();
          setActivityData(data);
        }
      } catch (err) {
        // Silent fail - will retry
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const draw = (time) => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);

      const activity = activityData?.system?.activityLevel || 0.3;
      const baseFreq = 0.02 + activity * 0.03;
      const amplitude = 3 + activity * 8;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 + activity * 0.4})`;
      ctx.lineWidth = 1;

      for (let i = 0; i < width; i++) {
        const x = i;
        const y = height / 2 + Math.sin((i + time * 0.1) * baseFreq) * amplitude;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      setPulsePhase((time / 1000) % (2 * Math.PI));
      animationId = requestAnimationFrame(draw);
    };

    draw(0);
    return () => cancelAnimationFrame(animationId);
  }, [activityData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activityData?.recent?.length]);

  const recent = activityData?.recent || [];
  const operations = activityData?.operations || { active: 0, complete: 0, pending: 0 };
  const memory = activityData?.memory || { files: [], searches: 0 };
  const tasks = activityData?.tasks || [];

  return (
    <div className={`rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden ${className}`}>
      {/* Header with pulse visualization */}
      <div className="relative px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-synapse-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-synapse-cyan" />
            </span>
            <span className="text-xs font-mono text-synapse-cyan uppercase tracking-wider">Live Activity</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-nova-200/50">
            <span className="flex items-center gap-1">
              <StatusIndicator status="running" />
              {operations.active}
            </span>
            <span className="flex items-center gap-1">
              <StatusIndicator status="complete" />
              {operations.complete}
            </span>
          </div>
        </div>
        
        {/* Pulse canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute bottom-0 left-0 right-0 h-8 opacity-50"
          style={{ width: '100%' }}
        />
      </div>

      {/* Activity Feed */}
      <div 
        ref={scrollRef}
        className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        <div className="p-3 space-y-1">
          <AnimatePresence initial={false}>
            {recent.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-[10px] font-mono text-nova-200/30 text-center py-4"
              >
                No activity recorded yet...
              </motion.div>
            ) : (
              recent.slice(0, 20).map((item, index) => (
                <motion.div
                  key={`${item.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={`flex items-start gap-2 py-1.5 px-2 rounded text-[10px] font-mono ${
                    index === 0 ? 'bg-white/5 border border-synapse-cyan/20' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <span className={`mt-0.5 ${
                    item.type === 'file' ? 'text-emerald-400' :
                    item.type === 'memory' ? 'text-fuchsia-400' :
                    item.type === 'tool' ? 'text-amber-400' :
                    item.type === 'task' ? 'text-synapse-cyan' :
                    'text-nova-300'
                  }`}>
                    <ActivityIcon type={item.type} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`truncate ${
                        item.type === 'error' ? 'text-red-300' : 'text-nova-200/80'
                      }`}>
                        {item.action}
                      </span>
                      {item.path && (
                        <span className="text-nova-200/40 truncate max-w-[120px]">
                          {truncatePath(item.path)}
                        </span>
                      )}
                    </div>
                    {item.details && (
                      <span className="text-nova-200/50 truncate block">{item.details}</span>
                    )}
                  </div>
                  <span className="text-nova-200/30 tabular-nums shrink-0">
                    {formatTime(item.timestamp)}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Memory Access Summary */}
      {memory.files.length > 0 && (
        <div className="px-3 py-2 border-t border-white/10 bg-white/[0.02]">
          <div className="text-[9px] uppercase tracking-wider text-nova-200/40 mb-1.5">Recent Memory</div>
          <div className="flex flex-wrap gap-1">
            {memory.files.slice(0, 6).map((file, i) => (
              <span 
                key={i} 
                className="text-[9px] px-1.5 py-0.5 rounded bg-fuchsia-500/10 text-fuchsia-300/80 border border-fuchsia-500/20 truncate max-w-[120px]"
                title={file}
              >
                {file.split('/').pop()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Task Status */}
      {tasks.length > 0 && (
        <div className="px-3 py-2 border-t border-white/10">
          <div className="text-[9px] uppercase tracking-wider text-nova-200/40 mb-1.5">Active Tasks</div>
          <div className="space-y-1">
            {tasks.slice(0, 3).map((task, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <StatusIndicator status={task.status} />
                  <span className="text-nova-200/70 truncate max-w-[140px]">{task.name}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                  task.status === 'running' ? 'bg-synapse-cyan/20 text-synapse-cyan' :
                  task.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                  task.status === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer stats */}
      <div className="px-3 py-2 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between text-[9px] font-mono text-nova-200/40">
          <span>SYS: {activityData?.system?.uptime || '--:--'}</span>
          <span>MEM: {memory.searches} searches</span>
          <span>OPS: {operations.active + operations.complete + operations.pending}</span>
        </div>
      </div>
    </div>
  );
}
