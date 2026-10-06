import { useCallback, useEffect, useState } from 'react';
import { fetchSettings, pickSetting } from '../services/settings';
import { isDemoMode } from '../utils/constants';

export function useSiteSettings() {
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (isDemoMode()) {
        if (alive) setLoading(false);
        return;
      }
      try {
        const data = await fetchSettings();
        if (alive) setMap(data);
      } catch {} finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const get = useCallback(
    (key, lng, fallback = '') => pickSetting(map, key, lng, fallback),
    [map]
  );

  return { settings: map, get, loading };
}
