import { Suspense, lazy, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Reveal } from '../components/Reveal';

const Visualizer = lazy(() => import('./Visualizer'));
const Paths = lazy(() => import('./Algorithms'));
const CubePage = lazy(() => import('./Cube'));

const TABS = [
  ['watch', 'watch algorithms run', Visualizer],
  ['paths', 'paths and tricks', Paths],
  ['cube', "rubik's cube solver", CubePage],
] as const;
type Key = (typeof TABS)[number][0];

const fromHash = (h: string): Key => (TABS.find(([k]) => `#${k}` === h)?.[0] ?? 'watch');

/** One home for everything algorithmic: sorting race, N-Queens, pathfinding, tricks and the cube. */
export default function AlgoHub() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Key>(fromHash(hash));
  useEffect(() => setTab(fromHash(hash)), [hash]);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-14">
      <Reveal>
        <p className="font-mono text-sm text-dim">for the curious</p>
        <h1 className="mt-2 font-mono text-3xl text-white sm:text-4xl">algorithms</h1>
        <div role="tablist" aria-label="Algorithm sections" className="mt-6 flex flex-wrap gap-2 font-mono text-sm">
          {TABS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => navigate({ hash: `#${k}` }, { replace: true })}
              className={`rounded-lg border px-4 py-2 transition ${tab === k ? 'border-lime bg-lime text-ink' : 'border-line text-mist hover:text-lime'}`}>
              {label}
            </button>
          ))}
        </div>
      </Reveal>
      <Suspense fallback={<p className="p-10 text-center font-mono text-dim">loading...</p>}>
        {TABS.map(([k, , C]) => (tab === k ? <C key={k} /> : null))}
      </Suspense>
    </main>
  );
}
