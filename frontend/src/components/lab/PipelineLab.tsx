import { useEffect, useState } from 'react';
import { lab } from '../../lib/api';
import type { PipelineResult } from '../../lib/types';

const COLORS = { DELIVERED: '#9dff5a', RECOVERED: '#ffd166', DEAD_LETTER: '#ff7a90' } as const;

function Slider({ label, value, min, max, step, fmt, onChange }: {
  label: string; value: number; min: number; max: number; step: number; fmt: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <label className="block font-mono text-xs text-dim">
      <span className="flex justify-between"><span>{label}</span><span className="text-lime">{fmt(value)}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
             className="mt-1 w-full accent-[#9dff5a]" aria-label={label} />
    </label>
  );
}

export function PipelineLab() {
  const [events, setEvents] = useState(60);
  const [failure, setFailure] = useState(0.4);
  const [retries, setRetries] = useState(4);
  const [base, setBase] = useState(100);
  const [seed, setSeed] = useState(7);
  const [res, setRes] = useState<PipelineResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      lab.pipeline({ events, failureRate: failure, maxRetries: retries, baseDelayMs: base, seed })
        .then((r) => { setRes(r); setError(''); })
        .catch((e: Error) => setError(e.message));
    }, 200);
    return () => clearTimeout(t);
  }, [events, failure, retries, base, seed]);

  const sample = res?.events.find((e) => e.outcome === 'DEAD_LETTER') ?? res?.events.find((e) => e.outcome === 'RECOVERED');

  return (
    <article className="card p-5">
      <h3 className="font-mono text-lg text-white">Retry with backoff and a dead-letter queue</h3>
      <p className="mt-1 max-w-3xl text-sm text-mist">
        In my ERP integration work, sync pipelines retry failed events with exponential backoff and send the ones that run out of
        retries to a dead-letter queue. This simulates that: each attempt fails at the rate you pick, the wait before
        retry <em>k</em> is base × 2<sup>k</sup>, and the Java service returns what happened to every event.
      </p>
      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          <Slider label="events" value={events} min={10} max={100} step={5} fmt={String} onChange={setEvents} />
          <Slider label="chance an attempt fails" value={failure} min={0} max={0.9} step={0.05} fmt={(v) => `${Math.round(v * 100)}%`} onChange={setFailure} />
          <Slider label="max retries" value={retries} min={0} max={8} step={1} fmt={String} onChange={setRetries} />
          <Slider label="base delay" value={base} min={10} max={1000} step={10} fmt={(v) => `${v} ms`} onChange={setBase} />
          <button className="btn btn-ghost !py-1.5" onClick={() => setSeed(Math.floor(Math.random() * 1e6))}>new random run</button>
        </div>
        <div>
          {error && <p role="alert" className="text-xs text-[#ff7a90]">{error}</p>}
          {res && (
            <>
              <div className="flex flex-wrap gap-1" aria-label="Outcome of each event">
                {res.events.map((e) => (
                  <span key={e.id} className="h-4 w-4 rounded-sm" style={{ background: COLORS[e.outcome] }}
                        title={`event ${e.id}: ${e.outcome.toLowerCase().replace('_', ' ')}, ${e.attempts} attempt${e.attempts > 1 ? 's' : ''}${e.backoffMs.length ? `, waits ${e.backoffMs.join(', ')} ms` : ''}`} />
                ))}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 font-mono text-xs">
                <div><dd className="text-xl" style={{ color: COLORS.DELIVERED }}>{res.deliveredFirstTry}</dd><dt className="text-dim">delivered first try</dt></div>
                <div><dd className="text-xl" style={{ color: COLORS.RECOVERED }}>{res.recovered}</dd><dt className="text-dim">recovered by retry</dt></div>
                <div><dd className="text-xl" style={{ color: COLORS.DEAD_LETTER }}>{res.deadLettered}</dd><dt className="text-dim">sent to DLQ</dt></div>
              </dl>
              <p className="mt-3 font-mono text-xs text-mist">
                Of the events that failed at least once, {Math.round(res.recoveryRate * 100)}% were recovered by retries.
              </p>
              {sample && (
                <p className="mt-2 font-mono text-xs text-dim">
                  e.g. event {sample.id}: {sample.attempts} attempts, waited {sample.backoffMs.length ? sample.backoffMs.join(' + ') + ' ms' : '0 ms'} → {sample.outcome.toLowerCase().replace('_', ' ')}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
