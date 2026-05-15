import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandConsole({ isOpen, onClose, projects = [], onCommand }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', text: 'Nova Command Console v1.0', timestamp: Date.now() },
    { type: 'system', text: 'Type "help" for available commands', timestamp: Date.now() },
  ]);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  const commands = {
    help: {
      desc: 'Show available commands',
      action: () => [
        'Available commands:',
        '  scan       - Refresh project data',
        '  status     - Show Nova system status', 
        '  open <name> - Open project folder',
        '  queue      - Show current queue',
        '  clear      - Clear console',
        '  help       - Show this message',
      ],
    },
    scan: {
      desc: 'Refresh project data',
      action: () => {
        if (onCommand) onCommand('scan');
        return ['Running npm run scan...', 'Project data refreshed.'];
      },
    },
    status: {
      desc: 'Show system status',
      action: () => [
        'Nova System Status:',
        '  Dashboard: Online',
        '  Memory:    Online',
        '  Avatar:    Connected',
        '  WhatsApp:  Online',
      ],
    },
    open: {
      desc: 'Open project folder',
      action: (args) => {
        if (!args[0]) return ['Usage: open <project-name>'];
        const project = projects.find(p => 
          p.name.toLowerCase().includes(args[0].toLowerCase()) ||
          p.slug?.toLowerCase() === args[0].toLowerCase()
        );
        if (project) {
          if (onCommand) onCommand('open', project);
          return [`Opening ${project.name}...`];
        }
        return [`Project "${args[0]}" not found.`];
      },
    },
    queue: {
      desc: 'Show current queue',
      action: () => [
        'Current Queue:',
        '  1. Visual effects polish',
        '  2. Architecture explorer',
        '  3. Avatar state bridge',
      ],
    },
    clear: {
      desc: 'Clear console',
      action: () => {
        setHistory([]);
        return [];
      },
    },
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parts = input.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Add command to history
    setHistory(prev => [...prev, { type: 'command', text: input, timestamp: Date.now() }]);

    // Execute command
    if (commands[cmd]) {
      const result = commands[cmd].action(args);
      if (result.length > 0) {
        setHistory(prev => [...prev, ...result.map(text => ({ type: 'output', text, timestamp: Date.now() }))]);
      }
    } else {
      setHistory(prev => [...prev, { type: 'error', text: `Command not found: ${cmd}`, timestamp: Date.now() }]);
    }

    setInput('');
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Update suggestions
    if (value.length > 0) {
      const matches = Object.entries(commands)
        .filter(([name, cmd]) => name.startsWith(value.toLowerCase()))
        .map(([name, cmd]) => ({ name, desc: cmd.desc }));
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (cmd) => {
    setInput(cmd);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="mx-4 mb-4">
            <div className="glass rounded-2xl border border-synapse-cyan/30 shadow-2xl shadow-synapse-cyan/10 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Nova Console</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-xs text-nova-400 hover:text-nova-200 transition-colors"
                >
                  ESC to close
                </button>
              </div>

              {/* Output history */}
              <div className="h-48 overflow-y-auto px-4 py-3 bg-black/60 font-mono text-sm space-y-1">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className={`${
                      entry.type === 'command' ? 'text-synapse-cyan' :
                      entry.type === 'error' ? 'text-red-400' :
                      entry.type === 'system' ? 'text-amber-400' :
                      'text-nova-200'
                    }`}
                  >
                    {entry.type === 'command' && (
                      <span className="text-nova-500">nova@hub:~$ </span>
                    )}
                    {entry.text}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="px-4 py-2 bg-black/40 border-t border-white/10">
                  <div className="flex gap-4 text-xs">
                    {suggestions.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => handleSuggestionClick(s.name)}
                        className="text-synapse-cyan hover:text-synapse-cyan/80 transition-colors"
                      >
                        <span className="font-mono">{s.name}</span>
                        <span className="text-nova-500 ml-2">— {s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex items-center px-4 py-3 bg-black/80 border-t border-white/10">
                <span className="text-emerald-500 font-mono text-sm mr-2">nova@hub:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-nova-100 font-mono text-sm outline-none placeholder:text-nova-600"
                  placeholder="Enter command..."
                  spellCheck={false}
                />
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
