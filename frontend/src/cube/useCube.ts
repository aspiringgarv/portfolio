import { useCallback, useEffect, useRef, useState } from 'react';
import { applyMove, solvedCube, type Anim, type Cubie, type Move } from './model';

/** Owns the cube state and plays queued moves one at a time with an eased turn animation. */
export function useCube() {
  const [cubies, setCubies] = useState<Cubie[]>(solvedCube);
  const [anim, setAnim] = useState<Anim | null>(null);
  const [applied, setApplied] = useState(0);
  const queue = useRef<{ move: Move; ms: number }[]>([]);
  const current = useRef<{ move: Move; ms: number; start: number } | null>(null);
  const raf = useRef(0);
  const [busy, setBusy] = useState(false);

  const tick = useCallback((now: number) => {
    let cur = current.current;
    if (!cur) {
      const next = queue.current.shift();
      if (!next) { setAnim(null); setBusy(false); raf.current = 0; return; }
      cur = current.current = { ...next, start: now };
    }
    const raw = Math.min(1, (now - cur.start) / cur.ms);
    const t = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
    if (raw >= 1) {
      const move = cur.move;
      current.current = null;
      setCubies((c) => applyMove(c, move));
      setApplied((n) => n + 1);
      setAnim(null);
    } else {
      setAnim({ face: cur.move.face, dir: cur.move.dir, t });
    }
    raf.current = requestAnimationFrame(tick);
  }, []);

  const enqueue = useCallback((moves: Move[], ms = 220) => {
    queue.current.push(...moves.map((move) => ({ move, ms })));
    setBusy(true);
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const reset = useCallback(() => {
    queue.current = [];
    current.current = null;
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    setAnim(null);
    setBusy(false);
    setCubies(solvedCube());
    setApplied(0);
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return { cubies, anim, busy, applied, enqueue, reset };
}
