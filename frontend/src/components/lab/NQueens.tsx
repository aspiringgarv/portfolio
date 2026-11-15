import { useEffect, useRef, useState } from 'react';

type Frame = { cols: number[]; tried: number; back: number; bad: number | null; solved: boolean };

/** Backtracking: place one queen per row, undo when a row has no safe column. */
function* solve(n: number): Generator<Frame> {
  const cols: number[] = [];
  let tried = 0, back = 0;
  const safe = (r: number, c: number) => cols.every((cc, rr) => cc !== c && Math.abs(cc - c) !== r - rr);
  function* go(r: number): Generator<Frame, boolean> {
    if (r === n) { yield { cols: cols.slice(), tried, back, bad: null, solved: true }; return true; }
    for (let c = 0; c < n; c++) {
      tried++;
      if (safe(r, c)) {
        cols.push(c);
        yield { cols: cols.slice(), tried, back, bad: null, solved: false };
        if (yield* go(r + 1)) return true;
        cols.pop(); back++;
        yield { cols: cols.slice(), tried, back, bad: null, solved: false };
      } else {
        yield { cols: cols.slice(), tried, back, bad: r * n + c, solved: false };
      }
    }
    return false;
  }
  yield* go(0);
}

export function NQueens() {
  const [n, setN] = useState(8);
  const [frame, setFrame] = useState<Frame>({ cols: [], tried: 0, back: 0, bad: null, solved: false });
  const [running, setRunning] = useState(false);
  const gen = useRef<Generator<Frame> | null>(null);

  const restart = (size: number) => { gen.current = solve(size); setFrame({ cols: [], tried: 0, back: 0, bad: null, solved: false }); setRunning(true); };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const r = gen.current?.next();
      if (!r || r.done) { setRunning(false); return; }
      setFrame(r.value);
      if (r.value.solved) setRunning(false);
    }, n > 8 ? 25 : 60);
    return () => window.clearInterval(id);
  }, [running, n]);

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
        <button className="btn !py-1.5" onClick={() => restart(n)}>{frame.tried ? 'run again' : 'place the queens'}</button>
        <label className="flex items-center gap-2 text-mist">board {n}×{n}
          <input type="range" min={4} max={12} value={n} className="accent-lime"
            onChange={(e) => { setN(+e.target.value); setRunning(false); gen.current = null; setFrame({ cols: [], tried: 0, back: 0, bad: null, solved: false }); }} />
        </label>
        <span className="text-dim">{frame.tried} squares tried · {frame.back} backtracks{frame.solved ? ' · solved' : ''}</span>
      </div>
      <div className="mx-auto mt-4 grid w-full max-w-sm" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} role="img" aria-label="N-Queens board">
        {Array.from({ length: n * n }, (_, k) => {
          const r = Math.floor(k / n), c = k % n;
          const queen = frame.cols[r] === c;
          return (
            <div key={k} className="flex aspect-square items-center justify-center text-[10px] sm:text-sm"
              style={{ background: frame.bad === k ? '#7a2a3a' : (r + c) % 2 ? '#16211a' : '#0e1510', color: frame.solved ? '#9dff5a' : '#e9ffe0' }}>
              {queen ? '♛' : ''}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-dim">Red squares are attacked and rejected. When a row runs out of safe squares, the previous queen moves. Push the board to 12 and watch the backtracks climb.</p>
    </div>
  );
}
