import { useEffect, useRef, useState } from 'react';

const DATA_URL = '/projects.json';
const NOVA_STATE_URL = '/nova-state.json';

export function useProjects() {
  const [state, setState] = useState({
    data: null,
    novaState: null,
    loading: true,
    error: null,
    lastFetch: null
  });
  const etagRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchOnce() {
      try {
        const headers = {};
        if (etagRef.current) headers['If-None-Match'] = etagRef.current;
        const [projectsRes, novaRes] = await Promise.all([
          fetch(DATA_URL + `?t=${Date.now()}`, { cache: 'no-store' }),
          fetch(NOVA_STATE_URL + `?t=${Date.now()}`, { cache: 'no-store' }).catch(() => null)
        ]);

        if (projectsRes.status === 304) {
          setState((s) => ({ ...s, loading: false, lastFetch: Date.now() }));
          return;
        }
        if (!projectsRes.ok) throw new Error(`HTTP ${projectsRes.status}`);
        const etag = projectsRes.headers.get('etag');
        if (etag) etagRef.current = etag;
        const json = await projectsRes.json();
        const novaState = novaRes && novaRes.ok ? await novaRes.json() : null;
        if (cancelled) return;
        setState({ data: json, novaState, loading: false, error: null, lastFetch: Date.now() });
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: err.message, lastFetch: Date.now() }));
      }
    }
    
    // Initial fetch
    fetchOnce();
    
    // Fallback slow poll just in case SSE fails
    const id = setInterval(fetchOnce, 60_000);
    
    // SSE connection for real-time updates
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'file_changed' && (data.file === 'projects.json' || data.file === 'nova-state.json')) {
          console.log(`[SSE] ${data.file} changed, fetching...`);
          fetchOnce();
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };
    eventSource.onerror = (err) => {
      console.log('SSE connection error, relying on fallback poll');
    };

    return () => {
      cancelled = true;
      clearInterval(id);
      eventSource.close();
    };
  }, []);

  return state;
}
