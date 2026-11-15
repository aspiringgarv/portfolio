import { useEffect, useState } from 'react';
import { api } from '../lib/api';

/** Counts one visit per browser session, then just reads the total. */
export function useVisits() {
  const [visits, setVisits] = useState<number | null>(null);
  useEffect(() => {
    let counted = false;
    try { counted = sessionStorage.getItem('pf.counted') === '1'; } catch { /* ignore */ }
    (counted ? api.stats() : api.visit()).then((s) => {
      setVisits(s.visits);
      try { sessionStorage.setItem('pf.counted', '1'); } catch { /* ignore */ }
    }).catch(() => undefined);
  }, []);
  return visits;
}
