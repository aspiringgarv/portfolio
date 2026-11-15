import { useSyncExternalStore } from 'react';
import { randomSeed } from './avatar';

export interface Identity { name: string; seed: string }
const KEY = 'pf.identity';

function load(): Identity {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const v = JSON.parse(raw) as Partial<Identity>;
      if (typeof v.seed === 'string') return { name: String(v.name ?? ''), seed: v.seed };
    }
  } catch { /* storage unavailable */ }
  return { name: '', seed: randomSeed() };
}

let current = load();
const listeners = new Set<() => void>();

export function updateIdentity(patch: Partial<Identity>) {
  current = { ...current, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function useIdentity(): Identity {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => current,
  );
}
