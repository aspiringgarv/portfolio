import { memo, useMemo } from 'react';
import { buildAvatar, GRID } from '../lib/avatar';

interface Props { seed: string; size?: number; className?: string; ring?: string }

/** Visitor avatar: pixel face generated from the seed. */
export const Avatar = memo(function Avatar({ seed, size = 32, className = '', ring }: Props) {
  const rects = useMemo(() => buildAvatar(seed), [seed]);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${GRID} ${GRID}`}
      className={`pixel shrink-0 rounded-md bg-line ${className}`}
      style={ring ? { boxShadow: `0 0 0 2px ${ring}` } : undefined}
      role="img"
      aria-label="avatar"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />
      ))}
    </svg>
  );
});
