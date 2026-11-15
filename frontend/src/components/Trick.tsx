import type { Trick } from '../lib/tricks';

export function TrickCard({ t, index }: { t: Trick; index: number }) {
  return (
    <details className="card group p-5 open:border-lime/40" open={index === 0}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="font-mono text-base text-white">{t.title}</span>
        <span className="chip shrink-0 transition group-open:border-lime group-open:text-lime">{t.complexity}</span>
      </summary>
      <dl className="mt-4 space-y-3 text-sm leading-relaxed">
        <div><dt className="font-mono text-xs text-dim">use it when</dt><dd>{t.when}</dd></div>
        <div><dt className="font-mono text-xs text-dim">the idea</dt><dd>{t.idea}</dd></div>
        <div><dt className="font-mono text-xs text-dim">practice</dt><dd className="text-lime">{t.practice}</dd></div>
      </dl>
      <pre className="mt-4 overflow-x-auto rounded-md border border-line bg-ink p-3 font-mono text-xs leading-relaxed text-mist"><code>{t.code}</code></pre>
    </details>
  );
}
