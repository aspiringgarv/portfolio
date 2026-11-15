import { useMemo, useState } from 'react';
import { Avatar } from './Avatar';
import { randomSeed, seedFromTraits, traitsFromSeed, TRAIT_DEFS, type Traits } from '../lib/avatar';
import { updateIdentity, type Identity } from '../lib/identity';

/** Build your visitor avatar: step through each trait, randomise, or pick from a gallery. */
export function AvatarStudio({ me }: { me: Identity }) {
  const traits = useMemo(() => traitsFromSeed(me.seed), [me.seed]);
  const [gallery, setGallery] = useState<string[]>(() => Array.from({ length: 8 }, randomSeed));
  const [draft, setDraft] = useState(me.name);

  const step = (key: keyof Traits, count: number, delta: number) =>
    updateIdentity({ seed: seedFromTraits({ ...traits, [key]: (traits[key] + delta + count) % count }) });

  return (
    <div className="card w-[19rem] space-y-3 p-3 font-mono text-xs">
      <div className="flex items-center gap-3">
        <Avatar seed={me.seed} size={84} ring="#9dff5a" className="rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <input value={draft} maxLength={24} placeholder="nickname" aria-label="Nickname"
                 onChange={(e) => setDraft(e.target.value)} onBlur={() => updateIdentity({ name: draft.trim() })}
                 className="w-full rounded-md border border-line bg-ink px-2 py-1.5 text-mist outline-none focus:border-lime" />
          <button className="btn btn-ghost w-full justify-center !px-2 !py-1.5 !text-xs" onClick={() => updateIdentity({ seed: randomSeed() })}>
            randomise
          </button>
        </div>
      </div>

      <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
        {TRAIT_DEFS.map((d) => (
          <div key={d.key} className="flex items-center justify-between gap-2">
            <span className="w-24 text-dim">{d.label}</span>
            <button aria-label={`Previous ${d.label}`} onClick={() => step(d.key, d.count, -1)} className="rounded border border-line px-2 py-0.5 hover:border-lime hover:text-lime">‹</button>
            <span className="w-16 text-center text-mist">{d.names ? d.names[traits[d.key]] : `${traits[d.key] + 1}/${d.count}`}</span>
            <button aria-label={`Next ${d.label}`} onClick={() => step(d.key, d.count, 1)} className="rounded border border-line px-2 py-0.5 hover:border-lime hover:text-lime">›</button>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-dim">
          <span>gallery</span>
          <button className="hover:text-lime" onClick={() => setGallery(Array.from({ length: 8 }, randomSeed))}>shuffle</button>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {gallery.map((s) => (
            <button key={s} aria-label="Use this avatar" onClick={() => updateIdentity({ seed: s })} className="rounded-md ring-lime transition hover:scale-110 hover:ring-2">
              <Avatar seed={s} size={28} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
