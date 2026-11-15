import { useState } from 'react';
import { Avatar } from './Avatar';
import { AvatarStudio } from './AvatarStudio';
import type { LivePeer } from '../hooks/useLive';
import type { Identity } from '../lib/identity';

const EMOJIS = ['👋', '🔥', '❤️', '🚀', '😂', '👏'];

interface Props { me: Identity; online: number; peers: LivePeer[]; onReact: (e: string) => void }

/** Bottom-right dock: who is online, your avatar (opens the studio), and reaction buttons. */
export function LiveDock({ me, online, peers, onReact }: Props) {
  const [open, setOpen] = useState(false);
  const react = (e: string) => {
    onReact(e);
    window.dispatchEvent(new CustomEvent('owner:mood', { detail: e }));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2 font-mono text-xs">
      {open && <AvatarStudio me={me} />}
      <div className="card flex flex-wrap items-center justify-end gap-2 p-1.5 pr-3">
        <button onClick={() => setOpen((o) => !o)} aria-label="Customise your avatar" aria-expanded={open} title="Customise your avatar">
          <Avatar seed={me.seed} size={30} ring="#9dff5a" />
        </button>
        {peers.length > 0 && (
          <span className="flex -space-x-2" aria-label="Visitors online">
            {peers.slice(0, 4).map((p) => (<Avatar key={p.id} seed={p.seed} size={24} ring={p.color} className="rounded-full" />))}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-mist">
          <span className={`h-2 w-2 rounded-full ${online > 0 ? 'bg-lime' : 'bg-dim'}`} />
          {online > 0 ? `${online} online` : 'offline'}
        </span>
        <span className="mx-1 hidden h-4 w-px bg-line sm:block" />
        {EMOJIS.map((e) => (
          <button key={e} onClick={() => react(e)} aria-label={`React ${e}`} className="text-base transition hover:scale-125">{e}</button>
        ))}
      </div>
    </div>
  );
}
