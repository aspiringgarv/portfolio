import { useRef, useState } from 'react';
import { cubieCss, stickerAt, type Anim, type Cubie, type FaceLetter, type Vec } from './model';

const SIZE = 56;
const COLORS: Record<FaceLetter, string> = { U: '#f4f4f0', R: '#d62d20', F: '#1fa24a', D: '#ffd31a', L: '#ff7a1a', B: '#1e6fd8' };
const FACES: { normal: Vec; css: string }[] = [
  { normal: [0, 0, 1], css: `translateZ(${SIZE / 2}px)` },
  { normal: [0, 0, -1], css: `rotateY(180deg) translateZ(${SIZE / 2}px)` },
  { normal: [1, 0, 0], css: `rotateY(90deg) translateZ(${SIZE / 2}px)` },
  { normal: [-1, 0, 0], css: `rotateY(-90deg) translateZ(${SIZE / 2}px)` },
  { normal: [0, 1, 0], css: `rotateX(90deg) translateZ(${SIZE / 2}px)` },
  { normal: [0, -1, 0], css: `rotateX(-90deg) translateZ(${SIZE / 2}px)` },
];

export function CubeView({ cubies, anim }: { cubies: Cubie[]; anim: Anim | null }) {
  const [view, setView] = useState({ rx: -30, ry: -40 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className="mx-auto flex h-[360px] w-full max-w-md cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing"
      style={{ perspective: 900 }}
      onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
        drag.current = { x: e.clientX, y: e.clientY };
        setView((v) => ({ ry: v.ry + dx * 0.5, rx: Math.max(-85, Math.min(85, v.rx - dy * 0.5)) }));
      }}
      onPointerUp={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
      role="img"
      aria-label="3D Rubik's cube. Drag to rotate the view."
    >
      <div className="relative" style={{ width: 0, height: 0, transformStyle: 'preserve-3d', transform: `rotateX(${view.rx}deg) rotateY(${view.ry}deg)` }}>
        {cubies.map((c) => (
          <div key={c.id} className="absolute" style={{ left: -SIZE / 2, top: -SIZE / 2, width: SIZE, height: SIZE, transformStyle: 'preserve-3d', transform: cubieCss(c, SIZE, anim) }}>
            {FACES.map((f, i) => {
              const letter = stickerAt(c, f.normal);
              return (
                <div key={i} className="absolute inset-0" style={{
                  transform: f.css, background: letter ? COLORS[letter] : '#0d0d0d',
                  boxShadow: 'inset 0 0 0 3px #0d0d0d', borderRadius: 6, backfaceVisibility: 'hidden',
                }} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
