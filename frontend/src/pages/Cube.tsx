import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CubeView } from '../cube/CubeView';
import { useCube } from '../cube/useCube';
import { FACE_ORDER, isSolved, moveName, parseMoves, randomScramble, toFacelets, type FaceLetter, type Move } from '../cube/model';

const SPEEDS = [['slow', 420], ['normal', 220], ['fast', 110]] as const;

export default function CubePage() {
  const { cubies, anim, busy, applied, enqueue, reset } = useCube();
  const worker = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const [solving, setSolving] = useState(false);
  const [scramble, setScramble] = useState<Move[]>([]);
  const [solution, setSolution] = useState<Move[] | null>(null);
  const [info, setInfo] = useState('');
  const [speed, setSpeed] = useState(220);
  const [playStart, setPlayStart] = useState<number | null>(null);

  useEffect(() => {
    const w = new Worker(new URL('../cube/solver.worker.ts', import.meta.url), { type: 'module' });
    worker.current = w;
    w.onmessage = (e: MessageEvent<{ type: string; solution?: string | null; ms?: number; message?: string }>) => {
      const m = e.data;
      if (m.type === 'ready') setReady(true);
      if (m.type === 'solved') {
        setSolving(false);
        if (m.solution === null || m.solution === undefined) { setInfo('No solution found.'); return; }
        const moves = m.solution.trim() ? parseMoves(m.solution) : [];
        setSolution(moves);
        setInfo(`Found a ${moves.length}-move solution in ${m.ms} ms.`);
      }
      if (m.type === 'error') { setSolving(false); setInfo(`Solver error: ${m.message}`); }
    };
    w.postMessage({ type: 'init' });
    return () => { w.terminate(); worker.current = null; };
  }, []);

  const solved = !busy && isSolved(cubies);
  const progress = playStart !== null && solution ? Math.min(solution.length, Math.max(0, applied - playStart)) : 0;

  const clearPlan = () => { setSolution(null); setPlayStart(null); setInfo(''); };
  const doScramble = () => {
    clearPlan();
    const s = randomScramble(20);
    setScramble(s);
    enqueue(s, 110);
  };
  const doMove = (face: FaceLetter, dir: 1 | -1) => { clearPlan(); setScramble([]); enqueue([{ face, dir }], speed); };
  const doSolve = () => {
    if (isSolved(cubies)) { setInfo('Already solved. Scramble it first.'); return; }
    setSolving(true); setInfo(ready ? 'Solving...' : 'Building solver tables (a few seconds the first time)...');
    worker.current?.postMessage({ type: 'solve', facelets: toFacelets(cubies) });
  };
  const play = () => { if (!solution) return; setPlayStart(applied); enqueue(solution, speed); };

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-14">
      <p className="font-mono text-sm text-dim">algorithms</p>
      <h1 className="mt-2 font-mono text-4xl text-white">rubik's cube solver</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist">
        Scramble the cube or turn it yourself, then press solve. A Kociemba two-phase solver finds the moves and the cube
        plays them back. Drag the cube to look around.{' '}
        <Link to="/algorithms" className="text-lime underline decoration-lime/40 hover:decoration-lime">More algorithms →</Link>
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card p-4">
          <CubeView cubies={cubies} anim={anim} />
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
            <button className="btn !py-1.5 !text-xs" disabled={busy || solving} onClick={doScramble}>scramble</button>
            <button className="btn !py-1.5 !text-xs" disabled={busy || solving} onClick={doSolve}>{solving ? 'solving...' : 'solve'}</button>
            <button className="btn btn-ghost !py-1.5 !text-xs" disabled={!solution || busy || solution.length === 0} onClick={play}>play solution</button>
            <button className="btn btn-ghost !py-1.5 !text-xs" onClick={() => { reset(); clearPlan(); setScramble([]); }}>reset</button>
            <span className="mx-1 h-4 w-px bg-line" />
            {SPEEDS.map(([label, ms]) => (
              <button key={label} onClick={() => setSpeed(ms)} aria-pressed={speed === ms}
                      className={`rounded-md border px-2 py-1 ${speed === ms ? 'border-lime bg-lime text-ink' : 'border-line text-mist'}`}>{label}</button>
            ))}
          </div>
          <p className="mt-3 min-h-[1.25rem] text-center font-mono text-xs text-lime" aria-live="polite">
            {solved && applied > 0 ? 'Solved.' : info}
          </p>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <p className="mb-2 font-mono text-xs text-dim">turn it yourself (tap = clockwise, shift-tap = counterclockwise)</p>
            <div className="grid grid-cols-6 gap-1.5">
              {FACE_ORDER.map((f) => (
                <button key={f} disabled={busy} onClick={(e) => doMove(f, e.shiftKey ? -1 : 1)}
                        className="rounded-md border border-line py-1.5 font-mono text-sm text-mist transition hover:border-lime hover:text-lime disabled:opacity-40">{f}</button>
              ))}
              {FACE_ORDER.map((f) => (
                <button key={`${f}'`} disabled={busy} onClick={() => doMove(f, -1)} aria-label={`${f} counterclockwise`}
                        className="rounded-md border border-line py-1.5 font-mono text-sm text-mist transition hover:border-lime hover:text-lime disabled:opacity-40">{f}'</button>
              ))}
            </div>
          </div>
          {scramble.length > 0 && (
            <div className="card p-4">
              <p className="mb-2 font-mono text-xs text-dim">scramble</p>
              <p className="font-mono text-sm text-mist">{scramble.map(moveName).join(' ')}</p>
            </div>
          )}
          {solution && (
            <div className="card p-4">
              <p className="mb-2 font-mono text-xs text-dim">solution ({solution.length} moves)</p>
              <ol className="flex flex-wrap gap-1.5 font-mono text-sm">
                {solution.map((m, i) => (
                  <li key={i} className={`rounded-md border px-2 py-0.5 ${i < progress ? 'border-lime/30 text-dim' : i === progress && busy ? 'border-lime bg-lime text-ink' : 'border-line text-mist'}`}>{moveName(m)}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      <section className="mt-14 grid gap-4 md:grid-cols-2" aria-label="How it works">
        <div className="card p-5">
          <h2 className="font-mono text-lg text-lime">notation</h2>
          <p className="mt-2 text-sm leading-relaxed">
            U, D, L, R, F, B are the up, down, left, right, front and back faces. A letter alone turns that face a quarter
            turn clockwise as you look straight at it. A trailing <code className="text-lime">'</code> means counterclockwise, and a
            trailing <code className="text-lime">2</code> means a half turn.
          </p>
        </div>
        <div className="card p-5">
          <h2 className="font-mono text-lg text-lime">how the solver thinks</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Phase 1 searches for moves that put the cube in a smaller group where every corner and edge is oriented and the four
            middle-slice edges sit in the middle slice. Phase 2 then finishes using only moves that stay in that group (U, D and
            half turns of the other faces). Both phases are IDA* searches guided by precomputed distance tables, which is why
            a short solution of about 20 moves arrives quickly. Every cube can be solved in at most 20 moves, but this method
            is fast rather than provably shortest, so you may see 21 or 22.
          </p>
        </div>
        <div className="card p-5 md:col-span-2">
          <h2 className="font-mono text-lg text-lime">what is mine and what isn't</h2>
          <p className="mt-2 text-sm leading-relaxed">
            The cube model (26 cubies with positions and rotation matrices), the 3D animation and the translation to the
            54-sticker format are written for this site, and I checked them against the solver library on hundreds of random move
            sequences. The search itself comes from the open-source <code className="text-lime">cubejs</code> library (Kociemba's
            algorithm in JavaScript), running in a web worker so the page never freezes.
          </p>
        </div>
      </section>
    </main>
  );
}
