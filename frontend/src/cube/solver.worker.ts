import Cube from 'cubejs';

// Kociemba two-phase solver. Building its pruning tables takes a few seconds, so it lives in a worker.
let ready = false;
const init = () => { if (!ready) { Cube.initSolver(); ready = true; } };

self.onmessage = (e: MessageEvent<{ type: 'init' } | { type: 'solve'; facelets: string }>) => {
  try {
    init();
    if (e.data.type === 'init') { (self as unknown as Worker).postMessage({ type: 'ready' }); return; }
    const t0 = performance.now();
    const solution = Cube.fromString(e.data.facelets).solve();
    (self as unknown as Worker).postMessage({ type: 'solved', solution, ms: Math.round(performance.now() - t0) });
  } catch (err) {
    (self as unknown as Worker).postMessage({ type: 'error', message: (err as Error).message });
  }
};
