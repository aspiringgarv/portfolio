import { Avatar } from './Avatar';
import type { LivePeer, LiveReaction } from '../hooks/useLive';

/** Renders other visitors' cursors and floating reactions over the whole page. */
export function LiveLayer({ peers, reactions }: { peers: LivePeer[]; reactions: LiveReaction[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-40 hidden overflow-hidden md:block">
      {peers.map((p) =>
        p.x === undefined || p.y === undefined ? null : (
          <div
            key={p.id}
            className="absolute transition-[left,top] duration-75 ease-linear"
            style={{ left: `${p.x * 100}%`, top: p.y }}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill={p.color} stroke="#0b0f0c" strokeWidth="1.2">
              <path d="M1 1 L1 16 L5 12 L8 19 L10.5 18 L7.5 11 L13 11 Z" />
            </svg>
            <div className="-mt-1 ml-3 flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2.5 font-mono text-[11px] text-ink" style={{ background: p.color }}>
              <Avatar seed={p.seed} size={18} className="rounded-full" />
              <span className="max-w-[110px] truncate">{p.name}</span>
            </div>
          </div>
        ),
      )}
      {reactions.map((r) => (
        <span key={r.key} className="float-up absolute text-3xl" style={{ left: `${r.x * 100}%`, top: r.y }}>
          {r.emoji}
        </span>
      ))}
    </div>
  );
}
