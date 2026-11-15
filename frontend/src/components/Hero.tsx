import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { OwnerAvatar } from './OwnerAvatar';
import { ICONS } from './Icons';
import { useScramble } from '../hooks/useScramble';
import type { Profile } from '../lib/types';

export function Hero({ profile, visits }: { profile: Profile; visits: number | null }) {
  const reduced = !!useReducedMotion();
  const name = useScramble(profile.name, reduced);
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % profile.roles.length), 2600);
    return () => clearInterval(t);
  }, [profile.roles.length]);
  const role = useScramble(profile.roles[i], reduced);

  return (
    <section id="top" className="mx-auto grid min-h-[calc(100vh-56px)] max-w-5xl items-center gap-10 px-5 py-16 md:grid-cols-[1.3fr_1fr]">
      <div>
        <p className="mb-3 font-mono text-sm text-dim">hello, world. i'm</p>
        <h1 className="font-mono text-5xl font-medium leading-tight text-white sm:text-6xl" aria-label={profile.name}>
          {name}
        </h1>
        <p className="mt-4 font-mono text-lg text-lime sm:text-xl">
          &gt; {role}<span className="caret" />
        </p>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{profile.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#projects" className="btn">view projects</a>
          <a href="/api/resume" target="_blank" rel="noopener" className="btn btn-ghost">download resume</a>
          <a href="#terminal" className="btn btn-ghost">open terminal</a>
        </div>
        <ul className="mt-8 flex items-center gap-4">
          {profile.profiles.map((p) => {
            const Icon = ICONS[p.id];
            return (
              <li key={p.id}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={p.name} title={`${p.name} ${p.handle}`}
                   className="block rounded-lg border border-line p-2 transition hover:-translate-y-0.5 hover:border-lime/60">
                  {Icon && <Icon size={22} />}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mx-auto w-full max-w-xs">
        <div className="card p-5 text-center">
          <div className="mx-auto w-44 rounded-xl bg-ink p-3 ring-1 ring-lime/40 sm:w-56">
            <OwnerAvatar size={200} />
          </div>
          <p className="mt-4 font-mono text-xs text-dim">move your mouse. i'm watching.</p>
          {visits !== null && (
            <p className="mt-2 font-mono text-xs text-mist">visitor #{visits.toLocaleString()}</p>
          )}
        </div>
      </div>
    </section>
  );
}
