import { useEffect, useState } from 'react';
import { Avatar } from './Avatar';
import { Reveal } from './Reveal';
import { api } from '../lib/api';
import { useIdentity } from '../lib/identity';
import type { GuestbookEntry } from '../lib/types';

export function Guestbook() {
  const me = useIdentity();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.guestbook().then(setEntries).catch(() => undefined); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError('Say something first.'); return; }
    setBusy(true); setError('');
    try {
      const entry = await api.sign({ name: me.name, text, avatarSeed: me.seed });
      setEntries((l) => [entry, ...l]);
      setText('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="guestbook" className="section">
      <Reveal>
        <h2 className="h2">guestbook</h2>
        <form onSubmit={submit} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-start" noValidate>
          <Avatar seed={me.seed} size={44} ring="#9dff5a" />
          <div className="flex-1">
            <textarea
              value={text}
              maxLength={200}
              rows={2}
              onChange={(e) => { setText(e.target.value); setError(''); }}
              placeholder={`Leave a note as ${me.name || 'anonymous'}...`}
              aria-label="Guestbook message"
              className="w-full resize-none rounded-md border border-line bg-ink p-2.5 text-sm text-mist outline-none focus:border-lime"
            />
            {error && <p role="alert" className="mt-1 text-xs text-[#ff7a90]">{error}</p>}
          </div>
          <button className="btn self-end" disabled={busy}>{busy ? 'signing...' : 'sign'}</button>
        </form>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {entries.map((g) => (
            <li key={g.id} className="card flex gap-3 p-3">
              <Avatar seed={g.avatarSeed} size={36} />
              <div className="min-w-0">
                <p className="font-mono text-xs text-lime">{g.name} <span className="text-dim">· {new Date(g.createdAt).toLocaleDateString()}</span></p>
                <p className="break-words text-sm">{g.text}</p>
              </div>
            </li>
          ))}
          {entries.length === 0 && <li className="font-mono text-sm text-dim">no entries yet. be the first.</li>}
        </ul>
      </Reveal>
    </section>
  );
}
