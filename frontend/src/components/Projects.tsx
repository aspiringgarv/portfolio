import { Reveal } from './Reveal';
import type { Project } from '../lib/types';

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="section">
      <h2 className="h2">projects</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.05}>
            <article className="card flex h-full flex-col p-5 transition hover:-translate-y-1 hover:border-lime/50">
              <h3 className="font-mono text-lg text-white">{p.title}</h3>
              <p className="text-sm text-lime">{p.subtitle}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-lime">
                {p.points.map((pt) => (<li key={pt}>{pt}</li>))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.stack.map((s) => (<span key={s} className="chip">{s}</span>))}
              </div>
              <div className="mt-auto flex flex-wrap gap-3 pt-5">
                {p.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-lime underline decoration-lime/40 underline-offset-4 hover:decoration-lime">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
