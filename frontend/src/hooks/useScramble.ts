import { useEffect, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}=+*^?#abcdefghijklmnopqrstuvwxyz';

/** Text that "decodes" into `target` whenever target changes. */
export function useScramble(target: string, reduced = false) {
  const [text, setText] = useState(reduced ? target : '');
  useEffect(() => {
    if (reduced) { setText(target); return; }
    let frame = 0;
    const total = 18;
    const id = setInterval(() => {
      frame++;
      const settled = Math.floor((frame / total) * target.length);
      setText(
        target.split('').map((c, i) => (c === ' ' || i < settled ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(''),
      );
      if (frame >= total) { clearInterval(id); setText(target); }
    }, 35);
    return () => clearInterval(id);
  }, [target, reduced]);
  return text;
}
