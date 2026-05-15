import { useState, useEffect } from 'react';

export function useSecondBrain() {
  const [data, setData] = useState({ stats: {}, entities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        // Fetch from the static JSON file
        const res = await fetch('/second-brain.json?t=' + Date.now());
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        
        if (mounted) {
          setData({
            stats: json.stats || {},
            entities: json.entities || []
          });
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          console.error("Failed to fetch second-brain.json", e);
          setError(e);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Fallback slow poll
    const intervalId = setInterval(fetchData, 60000);

    // SSE connection
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'file_changed' && data.file === 'second-brain.json') {
          console.log('[SSE] second-brain.json changed, fetching...');
          fetchData();
        }
      } catch (err) {}
    };

    return () => {
      mounted = false;
      clearInterval(intervalId);
      eventSource.close();
    };
  }, []);

  return { ...data, loading, error };
}
