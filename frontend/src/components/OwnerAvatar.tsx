import { useEffect, useRef, useState } from 'react';

const SKIN = '#e8b98f';
const HAIR = '#2b1d12';
const DARK = '#14100c';

/** Garv's pixel avatar: blinks, pupils track the cursor, waves on the "owner:wave" event. */
export function OwnerAvatar({ size = 220 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [waving, setWaving] = useState(false);
  const [mood, setMood] = useState<'laugh' | 'love' | 'cool' | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      setGaze({ x: dx > 60 ? 1 : dx < -60 ? -1 : 0, y: dy > 60 ? 1 : dy < -60 ? -1 : 0 });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        loop();
      }, 2200 + Math.random() * 2800);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onWave = () => { setWaving(true); clearTimeout(t); t = setTimeout(() => setWaving(false), 2600); };
    window.addEventListener('owner:wave', onWave);
    return () => { window.removeEventListener('owner:wave', onWave); clearTimeout(t); };
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onMood = (e: Event) => {
      const emoji = (e as CustomEvent<string>).detail;
      const m = emoji === '😂' ? 'laugh' : emoji === '❤️' ? 'love' : emoji === '🔥' ? 'cool' : null;
      if (!m) { window.dispatchEvent(new CustomEvent('owner:wave')); return; }
      setMood(m); clearTimeout(t); t = setTimeout(() => setMood(null), 2200);
    };
    window.addEventListener('owner:mood', onMood);
    return () => { window.removeEventListener('owner:mood', onMood); clearTimeout(t); };
  }, []);

  // pupils sit in the 2x2 eye; gaze shifts them by 0/1 px in the 16-unit grid
  const px = gaze.x > 0 ? 1 : 0;
  const py = gaze.y > 0 ? 1 : 0;
  const lookX = gaze.x < 0 ? 0 : px;

  return (
    <svg ref={ref} width="100%" height="100%" style={{ maxWidth: size, aspectRatio: '1' }} viewBox="0 0 16 16" className="pixel" role="img" aria-label="Pixel avatar of Garv">
      <rect x="2" y="12" width="12" height="4" fill="#9dff5a" />
      <rect x="6" y="12" width="1" height="3" fill={DARK} />
      <rect x="9" y="12" width="1" height="3" fill={DARK} />
      <rect x="7" y="11" width="2" height="1" fill="#c99a72" />
      <rect x="4" y="4" width="8" height="7" fill={SKIN} />
      <rect x="4" y="1" width="8" height="3" fill={HAIR} />
      <rect x="3" y="3" width="1" height="3" fill={HAIR} />
      <rect x="12" y="3" width="1" height="3" fill={HAIR} />
      <rect x="5" y="4" width="2" height="1" fill={HAIR} />
      {blink || mood === 'laugh' ? (
        <>
          <rect x="5" y="7" width="2" height="1" fill={DARK} />
          <rect x="9" y="7" width="2" height="1" fill={DARK} />
        </>
      ) : (
        <>
          <rect x="5" y="6" width="2" height="2" fill="#fff" />
          <rect x="9" y="6" width="2" height="2" fill="#fff" />
          <rect x={5 + lookX} y={6 + py} width="1" height="1" fill={DARK} />
          <rect x={9 + lookX} y={6 + py} width="1" height="1" fill={DARK} />
        </>
      )}
      {waving || mood === 'laugh' ? (
        <rect x="7" y="9" width="2" height="2" fill={DARK} />
      ) : (
        <>
          <rect x="6" y="9" width="1" height="1" fill={DARK} />
          <rect x="9" y="9" width="1" height="1" fill={DARK} />
          <rect x="7" y="10" width="2" height="1" fill={DARK} />
        </>
      )}
      {mood === 'cool' && (
        <>
          <rect x="5" y="5" width="6" height="1" fill="#101418" />
          <rect x="5" y="6" width="3" height="2" fill="#101418" />
          <rect x="8" y="6" width="3" height="2" fill="#101418" />
        </>
      )}
      {mood === 'love' && (
        <g fill="#ff7a90">
          <rect x="11" y="0" width="1" height="1" /><rect x="12" y="0" width="1" height="1" /><rect x="14" y="0" width="1" height="1" /><rect x="15" y="0" width="1" height="1" />
          <rect x="11" y="1" width="5" height="1" /><rect x="12" y="2" width="3" height="1" /><rect x="13" y="3" width="1" height="1" />
        </g>
      )}
      {waving && (
        <g className="wave-hand">
          <rect x="13" y="8" width="2" height="3" fill={SKIN} />
          <rect x="13" y="7" width="1" height="1" fill={SKIN} />
          <rect x="14" y="7" width="1" height="1" fill={SKIN} />
        </g>
      )}
    </svg>
  );
}
