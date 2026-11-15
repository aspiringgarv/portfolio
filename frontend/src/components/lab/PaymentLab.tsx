import { useEffect, useMemo, useState } from 'react';
import { lab } from '../../lib/api';
import type { Transition } from '../../lib/types';

const STATUSES = ['CREATED', 'AUTHORIZING', 'AUTHORIZED', 'CAPTURING', 'CAPTURED', 'SETTLED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED', 'CANCELLED', 'AUTH_EXPIRED'];
const EVENTS = ['AUTHORIZE_ATTEMPT', 'AUTHORIZE_SUCCESS', 'AUTHORIZE_FAIL', 'CAPTURE_REQUEST', 'CAPTURE_SUCCESS', 'CAPTURE_FAIL', 'CAPTURE_TIMEOUT', 'SETTLE', 'REFUND_INIT', 'REFUND_COMPLETE', 'CANCEL'];

export function PaymentLab() {
  const [table, setTable] = useState<Transition[]>([]);
  const [status, setStatus] = useState('CREATED');
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => { lab.transitions().then(setTable).catch(() => undefined); }, []);
  const valid = useMemo(() => new Set(table.filter((t) => t.from === status).map((t) => t.event)), [table, status]);

  const fire = async (event: string) => {
    try {
      const t = await lab.transition(status, event);
      setStatus(t.to);
      setLog((l) => [`${t.from} --${t.event}--> ${t.to}`, ...l].slice(0, 6));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <article className="card p-5">
      <h3 className="font-mono text-lg text-white">Payment state machine (from GoPay)</h3>
      <p className="mt-1 max-w-3xl text-sm text-mist">
        In GoPay a payment never changes status through a plain setter. Every change is a lookup of (current status,
        event) in a transition table, so an illegal change throws instead of corrupting the payment. This is that
        table, served by Java. Fire events at it, including the invalid ones.
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Payment statuses">
        {STATUSES.map((s) => (
          <span key={s} className={`rounded-md border px-2 py-1 font-mono text-xs ${s === status ? 'border-lime bg-lime text-ink' : 'border-line text-dim'}`}>{s}</span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {EVENTS.map((ev) => (
          <button key={ev} onClick={() => fire(ev)}
                  className={`rounded-md border px-2 py-1 font-mono text-xs transition ${valid.has(ev) ? 'border-lime/60 text-lime hover:bg-lime hover:text-ink' : 'border-line text-dim hover:border-[#ff7a90] hover:text-[#ff7a90]'}`}>
            {ev}
          </button>
        ))}
        <button onClick={() => { setStatus('CREATED'); setLog([]); setError(''); }} className="btn btn-ghost !px-2 !py-1 !text-xs">reset</button>
      </div>
      <p className="mt-2 font-mono text-xs text-dim">Green events are allowed from {status}. Red ones are rejected by the backend.</p>
      {error && <p role="alert" className="mt-3 break-words rounded-md border border-[#ff7a90]/40 bg-[#ff7a90]/10 p-2 font-mono text-xs text-[#ff7a90]">409 {error}</p>}
      {log.length > 0 && (
        <ol className="mt-3 space-y-1 font-mono text-xs text-mist" aria-label="Transition history">
          {log.map((l, i) => (<li key={`${l}-${i}`} className={i === 0 ? 'text-lime' : ''}>{l}</li>))}
        </ol>
      )}
    </article>
  );
}
