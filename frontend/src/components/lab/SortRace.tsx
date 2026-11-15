import { useCallback, useEffect, useRef, useState } from 'react';
import { makeData, SORTS, type Op, type Pattern } from '../../lib/sorts';

const N = 40;
const PATTERNS: Pattern[] = ['random', 'reversed', 'nearly sorted', 'few unique'];

type Lane = { a: number[]; gen: Generator<Op, void, void>; cmp: number; wr: number; hot: number[]; done: number | null };

function makeLanes(data: number[]): Lane[] {
  return SORTS.map((s) => { const a = data.slice(); return { a, gen: s.run(a), cmp: 0, wr: 0, hot: [], done: null }; });
}

export function SortRace() {
  const [pattern, setPattern] = useState<Pattern>('random');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [, force] = useState(0);
  const lanes = useRef<Lane[]>(makeLanes(makeData(N, 'random')));
  const ticks = useRef(0);
  const finished = useRef(0);

  const reset = useCallback((p: Pattern) => {
    lanes.current = makeLanes(makeData(N, p));
    ticks.current = 0; finished.current = 0;
    setRunning(false); force((x) => x + 1);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      ticks.current++;
      let alive = false;
      for (const l of lanes.current) {
        if (l.done !== null) { l.hot = []; continue; }
        for (let s = 0; s < speed; s++) {
          const r = l.gen.next();
          if (r.done) { l.done = ++finished.current; l.hot = []; break; }
          if (r.value.kind === 'cmp') l.cmp++; else l.wr++;
          l.hot = r.value.j === undefined ? [r.value.i] : [r.value.i, r.value.j];
        }
        if (l.done === null) alive = true;
      }
      force((x) => x + 1);
      if (!alive) setRunning(false);
    }, 40);
    return () => window.clearInterval(id);
  }, [running, speed]);

  const allDone = lanes.current.every((l) => l.done !== null);

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
        <button className="btn !py-1.5" onClick={() => { if (allDone) reset(pattern); else setRunning((r) => !r); }}>
          {allDone ? 'race again' : running ? 'pause' : ticks.current ? 'resume' : 'start race'}
        </button>
        <button className="btn btn-ghost !py-1.5" onClick={() => reset(pattern)}>reshuffle</button>
        <label className="flex items-center gap-2 text-mist">input
          <select className="rounded border border-line bg-panel px-2 py-1 text-lime" value={pattern}
            onChange={(e) => { const p = e.target.value as Pattern; setPattern(p); reset(p); }}>
            {PATTERNS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-mist">speed
          <input type="range" min={1} max={6} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="accent-lime" />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SORTS.map((s, k) => {
          const l = lanes.current[k];
          return (
            <div key={s.name} className="rounded-lg border border-line bg-ink/60 p-3">
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-lime">{s.name}</span>
                {l.done !== null
                  ? <span className="rounded bg-lime px-1.5 text-xs text-ink">#{l.done}</span>
                  : <span className="text-xs text-dim">O({s.avg})</span>}
              </div>
              <div className="mt-2 flex h-24 items-end gap-px" aria-hidden="true">
                {l.a.map((v, i) => (
                  <div key={i} className="flex-1" style={{
                    height: `${(v / N) * 100}%`,
                    background: l.done !== null ? '#9dff5a' : l.hot.includes(i) ? '#ff5a7a' : '#3c5a44',
                  }} />
                ))}
              </div>
              <p className="mt-2 font-mono text-[11px] text-dim">{l.cmp} compares · {l.wr} writes</p>
              <p className="mt-1 text-xs leading-snug text-mist">{s.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
