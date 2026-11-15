import { useEffect, useRef, useState } from 'react';
import { COMMAND_NAMES, REGISTRY, type Line } from '../terminal/commands';
import type { Profile } from '../lib/types';
import { Reveal } from './Reveal';

interface Entry { cmd: string; out: Line[] }

export function Terminal({ profile }: { profile: Profile }) {
  const [log, setLog] = useState<Entry[]>([{ cmd: '', out: ['Welcome. Type "help" to see what I can do.'] }]);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [log]);

  const run = async (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    history.current.push(cmd);
    cursor.current = history.current.length;
    const command = REGISTRY.get(cmd.toLowerCase());
    if (!command) {
      setLog((l) => [...l, { cmd, out: [`command not found: ${cmd}. try "help".`] }]);
      return;
    }
    setBusy(true);
    try {
      const out = await command.run({ profile, clear: () => setLog([]) });
      if (command.name !== 'clear') setLog((l) => [...l, { cmd, out }]);
      if (command.name === 'resume') window.open('/api/resume', '_blank', 'noopener');
    } catch {
      setLog((l) => [...l, { cmd, out: ['that command failed. is the backend running?'] }]);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !busy) { const v = value; setValue(''); void run(v); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cursor.current = Math.max(0, cursor.current - 1);
      setValue(history.current[cursor.current] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      cursor.current = Math.min(history.current.length, cursor.current + 1);
      setValue(history.current[cursor.current] ?? '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = COMMAND_NAMES().find((n) => value && n.startsWith(value.toLowerCase()));
      if (match) setValue(match);
    }
  };

  return (
    <section id="terminal" className="section">
      <Reveal>
        <h2 className="h2">terminal</h2>
        <div
          className="card overflow-hidden font-mono text-sm shadow-[0_0_40px_rgba(157,255,90,0.06)]"
          onClick={() => input.current?.focus({ preventScroll: true })}
        >
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            <span className="ml-3 text-xs text-dim">garv@portfolio: ~</span>
          </div>
          <div ref={box} className="h-80 space-y-3 overflow-y-auto p-4" role="log" aria-live="polite">
            {log.map((e, i) => (
              <div key={i}>
                {e.cmd && <p><span className="text-lime">$</span> {e.cmd}</p>}
                {e.out.map((l, j) =>
                  typeof l === 'string' ? (
                    <p key={j} className="whitespace-pre-wrap break-words text-mist">{l}</p>
                  ) : (
                    <p key={j}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="whitespace-pre-wrap break-all text-lime underline decoration-lime/40 hover:decoration-lime">
                        {l.text}
                      </a>
                    </p>
                  ),
                )}
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 border-t border-line px-4 py-3">
            <span className="text-lime">$</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              placeholder='try "help" (tab to complete)'
              aria-label="Terminal input"
              className="w-full bg-transparent text-mist outline-none placeholder:text-dim"
            />
          </label>
        </div>
      </Reveal>
    </section>
  );
}
