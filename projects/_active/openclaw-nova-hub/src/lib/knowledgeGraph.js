import { useEffect, useMemo, useState } from 'react';

const KNOWLEDGE_GRAPH_URL = '/knowledge-graph.json';

function normalizeGraphPayload(payload) {
  if (!payload || !Array.isArray(payload.nodes) || !Array.isArray(payload.links)) {
    return {
      generated: null,
      stats: { totalNodes: 0, links: 0 },
      nodes: [],
      links: [],
      emergingThemes: [],
      unexpectedConnections: [],
      timeline: []
    };
  }

  return {
    generated: payload.generated || null,
    stats: payload.stats || { totalNodes: payload.nodes.length, links: payload.links.length },
    nodes: payload.nodes,
    links: payload.links,
    emergingThemes: payload.emergingThemes || [],
    unexpectedConnections: payload.unexpectedConnections || [],
    timeline: payload.timeline || []
  };
}

export function useKnowledgeGraph() {
  const [state, setState] = useState({
    data: normalizeGraphPayload(null),
    loading: true,
    error: null,
    lastFetch: null,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const res = await fetch(`${KNOWLEDGE_GRAPH_URL}?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        setState({
          data: normalizeGraphPayload(json),
          loading: false,
          error: null,
          lastFetch: Date.now(),
        });
      } catch (error) {
        if (!mounted) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
          lastFetch: Date.now(),
        }));
      }
    }

    fetchData();
    const intervalId = setInterval(fetchData, 60_000);
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'file_changed' && data.file === 'knowledge-graph.json') {
          fetchData();
        }
      } catch {}
    };

    return () => {
      mounted = false;
      clearInterval(intervalId);
      eventSource.close();
    };
  }, []);

  const insights = useMemo(() => ({
    emergingThemes: state.data.emergingThemes || [],
    unexpectedConnections: state.data.unexpectedConnections || [],
    timeline: state.data.timeline || [],
  }), [state.data]);

  return {
    ...state,
    insights,
  };
}
