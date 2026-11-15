import { ICONS } from './Icons';
import { Reveal } from './Reveal';
import type { CodingProfile } from '../lib/types';

export function CodingProfiles({ profiles }: { profiles: CodingProfile[] }) {
  return (
    <section id="profiles" className="section !pt-0">
      <Reveal>
        <h2 className="h2">find me online</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {profiles.map((p) => {
            const Icon = ICONS[p.id];
            return (
              <li key={p.id}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group flex h-full flex-col gap-3 p-4 transition hover:-translate-y-1 hover:border-lime/60"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-ink">
                    {Icon && <Icon size={24} />}
                  </span>
                  <span>
                    <span className="block font-mono text-sm text-lime">{p.name}</span>
                    <span className="block font-mono text-xs text-mist">{p.handle}</span>
                    <span className="mt-1 block text-xs text-dim">{p.note}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
