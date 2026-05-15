import { useEffect, useRef, useState, useMemo } from 'react';
import { timeAgo } from '../lib/format.js';

/**
 * CommandPalette — Cmd+K global search across projects, dashboards, and entities.
 * Quick navigation for 21+ projects.
 */
export default function CommandPalette({ projects, secondBrain, isOpen, onClose, onSelect }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Build search index
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const items = [];

    // Projects
    for (const p of projects) {
      const hay = `${p.name} ${p.oneLiner ?? ''} ${p.tags?.join(' ') ?? ''} ${p.domain}`.toLowerCase();
      if (hay.includes(q)) {
        items.push({
          type: 'project',
          id: p.id,
          title: p.name,
          subtitle: p.oneLiner || p.domain,
          icon: '📁',
          data: p
        });
      }
    }

    // Dashboards
    for (const p of projects) {
      for (const dash of p.subDashboards ?? []) {
        const hay = `${dash.label} ${p.name}`.toLowerCase();
        if (hay.includes(q)) {
          items.push({
            type: 'dashboard',
            id: `${p.id}-${dash.label}`,
            title: dash.label,
            subtitle: `${p.name} · ${dash.type}`,
            icon: dash.type === 'godot' ? '🎮' : dash.type === 'html' ? '📊' : '📁',
            data: dash
          });
        }
      }
    }

    // Second Brain entities
    for (const e of secondBrain ?? []) {
      if (e.name.toLowerCase().includes(q)) {
        items.push({
          type: 'entity',
          id: e.name,
          title: e.name,
          subtitle: `${e.count} mentions`,
          icon: '🧠',
          data: e
        });
      }
    }

    return items.slice(0, 12);
  }, [query, projects, secondBrain]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item) => {
    onSelect?.(item);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-xl glass rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-nova-200/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, dashboards, entities..."
              className="flex-1 bg-transparent text-nova-50 placeholder:text-nova-200/40 focus:outline-none text-lg"
            />
            <kbd className="text-[10px] px-2 py-1 rounded bg-white/[0.08] text-nova-200/60">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-auto">
          {query && results.length === 0 && (
            <div className="p-8 text-center text-nova-200/60">
              No results for "{query}"
            </div>
          )}

          {results.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === selectedIndex ? 'bg-nova-500/20' : 'hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-nova-50 font-medium truncate">{item.title}</div>
                <div className="text-xs text-nova-200/60 truncate">{item.subtitle}</div>
              </div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.05] text-nova-200/50">
                {item.type}
              </span>
            </button>
          ))}
        </div>

        {/* Footer hints */}
        <div className="p-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-nova-200/50">
          <div className="flex items-center gap-4">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.08]">↑↓</kbd> navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.08]">↵</kbd> open</span>
          </div>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}