import { useState, useEffect } from 'react';

// Live Nova State Hook - polls for real-time updates
export default function useLiveNovaState(initialState = null) {
  const [novaState, setNovaState] = useState(initialState);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    async function fetchState() {
      try {
        const response = await fetch(`/nova-state.json?_t=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();
        if (JSON.stringify(data) !== JSON.stringify(novaState)) {
          setNovaState(data);
          setLastUpdate(Date.now());
        }
      } catch (e) {
        // Silent fail - keep existing state
      }
    }

    fetchState();
    const interval = setInterval(fetchState, 500);
    return () => clearInterval(interval);
  }, []);

  return { novaState, lastUpdate };
}
