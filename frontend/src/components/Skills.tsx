import { Reveal } from './Reveal';
import type { Profile } from '../lib/types';

export function Skills({ profile }: { profile: Profile }) {
  return (
    <section id="skills" className="section">
      <Reveal>
        <h2 className="h2">skills and wins</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card space-y-4 p-5">
            {Object.entries(profile.skills).map(([group, items]) => (
              <div key={group}>
                <p className="mb-2 font-mono text-xs text-dim">{group}</p>
                <div className="flex flex-wrap gap-1.5">{items.map((s) => (<span key={s} className="chip">{s}</span>))}</div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <p className="mb-3 font-mono text-xs text-dim">achievements</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-lime">
              {profile.achievements.map((a) => (<li key={a}>{a}</li>))}
            </ul>
            <p className="mb-2 mt-6 font-mono text-xs text-dim">education</p>
            {profile.education.map((e) => (
              <p key={e.school} className="text-sm">{e.school}, {e.degree}<br /><span className="text-dim">{e.period} · {e.grade}</span></p>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
