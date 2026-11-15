import { Reveal } from './Reveal';
import type { Profile } from '../lib/types';

export function Experience({ profile }: { profile: Profile }) {
  return (
    <section id="experience" className="section">
      <Reveal>
        <h2 className="h2">experience</h2>
        {profile.experience.map((e) => (
          <article key={e.company} className="card p-6">
            <h3 className="font-mono text-xl text-white">{e.company}</h3>
            <ul className="mt-2 space-y-1 font-mono text-sm text-dim">
              {e.roles.map((r) => (<li key={r.title}><span className="text-lime">{r.title}</span> · {r.period}</li>))}
            </ul>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed marker:text-lime">
              {e.points.map((p) => (<li key={p}>{p}</li>))}
            </ul>
          </article>
        ))}
      </Reveal>
      <Reveal className="mt-10 grid gap-3 md:grid-cols-3" delay={0.1}>
        {profile.leadership.map((l) => (
          <div key={l.title} className="card p-4">
            <p className="font-mono text-sm text-lime">{l.title}</p>
            <p className="text-xs text-dim">{l.org} · {l.period}</p>
            <p className="mt-2 text-sm leading-relaxed">{l.text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
