import { PathfindLab } from '../components/lab/PathfindLab';
import { TrickCard } from '../components/Trick';
import { Reveal } from '../components/Reveal';
import { TRICKS } from '../lib/tricks';
import { useProfile } from '../hooks/useProfile';

const SEARCHES = [
  { name: 'BFS', rule: 'Explores in rings: all cells 1 step away, then 2 steps, and so on, using a queue.', use: 'Shortest path when every step costs the same.', cost: 'O(V + E)' },
  { name: 'Dijkstra', rule: 'Always expands the cheapest unexplored cell next, using a priority queue.', use: 'Shortest path with different non-negative costs, like the mud cells below.', cost: 'O((V + E) log V)' },
  { name: 'A*', rule: 'Dijkstra plus a guess of the distance left. It expands by cost so far + guess.', use: 'One start and one goal. Optimal if the guess never overestimates; Manhattan distance works on this grid.', cost: 'same worst case, usually far fewer cells' },
];

export default function Algorithms() {
  const { profile } = useProfile();
  return (
    <div className="pt-8">
      <Reveal>
        <p className="font-mono text-sm text-dim">notes from contest practice</p>
        <h2 className="mt-2 font-mono text-2xl text-white">algorithms and tricks</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist">
          A page for learning, not showing off. Shortest-path search you can watch run, and the techniques I reach for most
          in contests and interviews, each with the idea, the cost, a Java snippet and a problem to try.
          {profile && (
            <> My profiles: <a className="text-lime underline decoration-lime/40 hover:decoration-lime" href={profile.links.leetcode} target="_blank" rel="noopener noreferrer">LeetCode</a>,{' '}
            <a className="text-lime underline decoration-lime/40 hover:decoration-lime" href={profile.links.codeforces} target="_blank" rel="noopener noreferrer">Codeforces</a>.</>
          )}
        </p>
      </Reveal>

      <section className="mt-16" aria-labelledby="paths">
        <h2 id="paths" className="h2">shortest paths on a grid</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {SEARCHES.map((s) => (
            <Reveal key={s.name}>
              <div className="card h-full p-4">
                <p className="font-mono text-lg text-lime">{s.name}</p>
                <p className="mt-2 text-sm leading-relaxed">{s.rule}</p>
                <p className="mt-2 text-sm leading-relaxed text-mist">{s.use}</p>
                <p className="mt-3 font-mono text-xs text-dim">{s.cost}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-6"><Reveal><PathfindLab /></Reveal></div>
        <p className="mt-3 text-sm text-dim">Try the same map with all three. BFS ignores the mud, so its path can cost more. Dijkstra and A* agree on the cost, and A* explores fewer cells.</p>
      </section>

      <section className="mt-20" aria-labelledby="tricks">
        <h2 id="tricks" className="h2">tricks worth knowing</h2>
        <div className="space-y-3">
          {TRICKS.map((t, i) => (<Reveal key={t.title}><TrickCard t={t} index={i} /></Reveal>))}
        </div>
      </section>
    </div>
  );
}
