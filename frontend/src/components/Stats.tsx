import { Reveal } from './Reveal';
import type { Stat } from '../lib/types';

export function Stats({ stats }: { stats: Stat[] }) {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-10">
      <Reveal>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-4">
              <dd className="font-mono text-3xl text-lime">{s.value}</dd>
              <dt className="mt-1 text-sm text-mist">{s.label}</dt>
              <p className="text-xs text-dim">{s.note}</p>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
