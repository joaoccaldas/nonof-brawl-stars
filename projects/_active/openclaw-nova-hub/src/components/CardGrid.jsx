import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import ProjectCard from './ProjectCard.jsx';

const STATUS_ORDER = { active: 0, prototyping: 1, validating: 2, paused: 3, unknown: 4 };
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function CardGrid({ projects, selected, onSelect, onOpenProject }) {
  const [query, setQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [sortKey, setSortKey] = useState('relevance');

  const domains = useMemo(() => {
    const s = new Set(projects.map((p) => p.domain));
    return ['all', ...Array.from(s)];
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = projects.filter((p) => {
      if (domainFilter !== 'all' && p.domain !== domainFilter) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.oneLiner ?? ''} ${p.tags?.join(' ') ?? ''} ${p.slug}`.toLowerCase();
      return hay.includes(q);
    });
    if (sortKey === 'recent') {
      list = list.slice().sort(
        (a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)
      );
    } else if (sortKey === 'priority') {
      list = list.slice().sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 1;
        const pb = PRIORITY_ORDER[b.priority] ?? 1;
        if (pa !== pb) return pa - pb;
        return new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0);
      });
    } else if (sortKey === 'status') {
      list = list.slice().sort((a, b) => {
        const sa = STATUS_ORDER[a.status] ?? 99;
        const sb = STATUS_ORDER[b.status] ?? 99;
        if (sa !== sb) return sa - sb;
        return new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0);
      });
    } else {
      // relevance = status+priority+recency
      list = list.slice().sort((a, b) => {
        const score = (p) =>
          (STATUS_ORDER[p.status] ?? 4) * 100 +
          (PRIORITY_ORDER[p.priority] ?? 1) * 10 -
          (p.lastUpdated ? new Date(p.lastUpdated).getTime() / 1e11 : 0);
        return score(a) - score(b);
      });
    }
    return list;
  }, [projects, query, domainFilter, sortKey]);

  return (
    <section className="mt-8">
      {/* Controls row - compact header for List View */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3 text-nova-200/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="text-[11px] uppercase tracking-wider text-nova-200/50">List View</span>
          <span className="text-[10px] text-nova-200/30">{filtered.length} of {projects.length}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-nova-50 placeholder:text-nova-200/40 focus:outline-none focus:border-nova-300/50 w-64"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nova-200/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-nova-50 focus:outline-none focus:border-nova-300/50"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="recent">Sort: Recent</option>
            <option value="priority">Sort: Priority</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      {/* Domain chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {domains.map((d) => {
          const active = domainFilter === d;
          return (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? 'bg-nova-500/20 border-nova-300/60 text-nova-50'
                  : 'bg-white/[0.03] border-white/[0.06] text-nova-200/70 hover:text-nova-50 hover:border-white/20'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              selected={selected?.id === p.id}
              onSelect={(proj) => {
                onSelect?.(proj);
                onOpenProject?.(proj);
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 text-sm text-nova-200/60 text-center py-12 glass rounded-2xl">
          No projects match "{query}".
        </div>
      )}
    </section>
  );
}
