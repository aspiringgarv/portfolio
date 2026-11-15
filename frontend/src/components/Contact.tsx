import { useState } from 'react';
import { Reveal } from './Reveal';
import { ICONS } from './Icons';
import { api } from '../lib/api';
import type { Profile } from '../lib/types';

export function Contact({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const Mail = ICONS.mail;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value })); setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) { setError('Name and message are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Enter a valid email.'); return; }
    setStatus('sending'); setError('');
    try {
      await api.contact(form);
      setStatus('sent');
    } catch (err) {
      setStatus('idle'); setError((err as Error).message);
    }
  };

  const field = 'w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-mist outline-none focus:border-lime';

  return (
    <section id="contact" className="section">
      <Reveal>
        <h2 className="h2">contact</h2>
        <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <div className="card space-y-4 p-5">
            <p>Open to backend and platform engineering roles, and good conversations about data pipelines.</p>
            <a href={`mailto:${profile.email}`} className="flex items-center gap-3 font-mono text-sm text-lime hover:underline">
              <Mail size={22} /> {profile.email}
            </a>
            <div className="font-mono text-sm">
              {showPhone ? (
                <a href={`tel:${profile.phone}`} className="text-lime hover:underline">{profile.phone}</a>
              ) : (
                <button className="btn btn-ghost !py-1.5" onClick={() => setShowPhone(true)}>reveal phone</button>
              )}
            </div>
            <a href="/api/resume" target="_blank" rel="noopener" className="btn w-fit">download resume</a>
          </div>
          {status === 'sent' ? (
            <div className="card flex items-center justify-center p-8 text-center font-mono text-lime" role="status">
              message sent. thanks, I'll get back to you.
            </div>
          ) : (
            <form onSubmit={submit} className="card space-y-3 p-5" noValidate>
              <input className={field} placeholder="Your name" aria-label="Your name" maxLength={80} value={form.name} onChange={set('name')} />
              <input className={field} placeholder="you@company.com" aria-label="Your email" type="email" maxLength={120} value={form.email} onChange={set('email')} />
              <textarea className={`${field} resize-none`} rows={5} placeholder="Tell me what you're building" aria-label="Message" maxLength={2000} value={form.message} onChange={set('message')} />
              <input className="hidden" tabIndex={-1} autoComplete="off" aria-hidden name="website" value={form.website} onChange={set('website')} />
              {error && <p role="alert" className="text-xs text-[#ff7a90]">{error}</p>}
              <button className="btn" disabled={status === 'sending'}>{status === 'sending' ? 'sending...' : 'send message'}</button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
