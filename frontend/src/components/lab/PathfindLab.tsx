import { useCallback, useEffect, useRef, useState } from 'react';
import { lab } from '../../lib/api';

const ROWS = 14;
const COLS = 30;
const START = 7 * COLS + 2;
const END = 7 * COLS + COLS - 3;
const ALGOS = [['BFS', 'BFS'], ['DIJKSTRA', 'Dijkstra'], ['ASTAR', 'A*']] as const;
type Tool = 'wall' | 'mud' | 'erase';

const blank = () => Array<number>(ROWS * COLS).fill(1);

export function PathfindLab() {
  const [cells, setCells] = useState<number[]>(blank);
  const [tool, setTool] = useState<Tool>('wall');
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [path, setPath] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState('');
  const [busy, setBusy] = useState(false);
  const drawing = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval>>();

  const stop = () => { if (timer.current) clearInterval(timer.current); };
  useEffect(() => stop, []);

  const paint = useCallback((i: number) => {
    if (i === START || i === END) return;
    const v = tool === 'wall' ? -1 : tool === 'mud' ? 5 : 1;
    setCells((c) => (c[i] === v ? c : c.map((x, k) => (k === i ? v : x))));
  }, [tool]);

  const reset = () => { stop(); setVisited(new Set()); setPath(new Set()); setStats(''); setBusy(false); };

  const randomize = () => {
    reset();
    setCells(Array.from({ length: ROWS * COLS }, (_, i) => {
      if (i === START || i === END) return 1;
      const r = Math.random();
      return r < 0.24 ? -1 : r < 0.36 ? 5 : 1;
    }));
  };

  const run = async (algorithm: string, label: string) => {
    reset();
    setBusy(true);
    try {
      const r = await lab.pathfind({ rows: ROWS, cols: COLS, cells, start: START, end: END, algorithm });
      const seen = new Set<number>();
      let k = 0;
      const step = Math.max(1, Math.ceil(r.visited.length / 90));
      timer.current = setInterval(() => {
        for (let n = 0; n < step && k < r.visited.length; n++) seen.add(r.visited[k++]);
        setVisited(new Set(seen));
        if (k >= r.visited.length) {
          stop();
          setPath(new Set(r.path));
          setBusy(false);
          setStats(r.found
            ? `${label}: explored ${r.visitedCount} cells, path of ${r.path.length - 1} steps, total cost ${r.cost}`
            : `${label}: explored ${r.visitedCount} cells, no path exists`);
        }
      }, 16);
    } catch (e) {
      setStats((e as Error).message);
      setBusy(false);
    }
  };

  const cls = (i: number) => {
    if (i === START) return 'bg-[#6ec6ff]';
    if (i === END) return 'bg-[#ff7a90]';
    if (path.has(i)) return 'bg-lime';
    if (cells[i] === -1) return 'bg-[#56695c]';
    if (visited.has(i)) return cells[i] > 1 ? 'bg-[#5ee6c0]/70' : 'bg-[#5ee6c0]/45';
    if (cells[i] > 1) return 'bg-[#6b4e2e]';
    return 'bg-ink';
  };

  return (
    <article className="card p-5">
      <h3 className="font-mono text-lg text-white">Pathfinding: BFS vs Dijkstra vs A*</h3>
      <p className="mt-1 max-w-3xl text-sm text-mist">
        Draw walls and mud (cost 5 to enter), then run an algorithm. The Java service returns the order cells were
        explored and the final path. BFS counts steps and ignores mud; Dijkstra finds the cheapest path; A* finds the
        same cheapest path but explores fewer cells because its Manhattan-distance heuristic steers it toward the goal.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
        {(['wall', 'mud', 'erase'] as Tool[]).map((t) => (
          <button key={t} onClick={() => setTool(t)} aria-pressed={tool === t}
                  className={`rounded-md border px-2.5 py-1 ${tool === t ? 'border-lime bg-lime text-ink' : 'border-line text-mist'}`}>{t}</button>
        ))}
        <span className="mx-1 h-4 w-px bg-line" />
        {ALGOS.map(([id, label]) => (
          <button key={id} disabled={busy} onClick={() => run(id, label)} className="btn !px-3 !py-1 !text-xs">run {label}</button>
        ))}
        <button onClick={randomize} className="btn btn-ghost !px-3 !py-1 !text-xs">random map</button>
        <button onClick={() => { reset(); setCells(blank()); }} className="btn btn-ghost !px-3 !py-1 !text-xs">clear</button>
      </div>
      <div
        className="mt-4 grid touch-none select-none gap-px overflow-hidden rounded-md border border-line bg-line"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        onPointerDown={(e) => { drawing.current = true; (e.target as HTMLElement).releasePointerCapture?.(e.pointerId); }}
        onPointerUp={() => { drawing.current = false; }}
        onPointerLeave={() => { drawing.current = false; }}
        role="grid" aria-label="Pathfinding grid"
      >
        {cells.map((_, i) => (
          <div key={i} role="gridcell" className={`aspect-square ${cls(i)}`}
               onPointerDown={() => { reset(); paint(i); }}
               onPointerEnter={() => { if (drawing.current) paint(i); }} />
        ))}
      </div>
      <p className="mt-3 min-h-[1.25rem] font-mono text-xs text-lime" aria-live="polite">{stats}</p>
      <p className="mt-1 font-mono text-[11px] text-dim">blue start · red goal · teal explored · lime path · brown mud · grey wall</p>
    </article>
  );
}
