import type { ReactElement } from 'react';

/** Brand marks drawn inline (no network, no icon font). Each takes a size and inherits color where sensible. */
type IconProps = { size?: number };

const GITHUB =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';

export const GitHubIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="#e8ffe0" aria-hidden><path d={GITHUB} /></svg>
);

export const LeetCodeIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" aria-hidden>
    <path d="M15.5 4.5 7 13.2a3 3 0 0 0 0 4.2l2 2a3 3 0 0 0 4.2 0l2.3-2.3" stroke="#ffa116" />
    <path d="M10.5 12.5h9" stroke="#e8ffe0" />
  </svg>
);

export const CodeforcesIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <rect x="2" y="9" width="5" height="12" rx="1" fill="#f5c542" />
    <rect x="9.5" y="3" width="5" height="18" rx="1" fill="#3b82f6" />
    <rect x="17" y="12" width="5" height="9" rx="1" fill="#ef4444" />
  </svg>
);

export const AtCoderIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="#e8ffe0" strokeWidth="1.8" />
    <path d="M7 16.5 12 6l5 10.5M9.2 13h5.6" stroke="#e8ffe0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LinkedInIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#4aa3ff" />
    <rect x="5.5" y="9.5" width="2.6" height="8" fill="#0b0f0c" />
    <circle cx="6.8" cy="6.8" r="1.5" fill="#0b0f0c" />
    <path d="M10.5 9.5h2.5v1.2c.5-.9 1.5-1.4 2.7-1.4 2.2 0 3 1.4 3 3.6v4.6h-2.6v-4.1c0-1.1-.4-1.7-1.3-1.7-1 0-1.7.7-1.7 1.9v3.9h-2.6z" fill="#0b0f0c" />
  </svg>
);

export const MailIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#9dff5a" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" strokeLinecap="round" />
  </svg>
);

export const ICONS: Record<string, (p: IconProps) => ReactElement> = {
  github: GitHubIcon,
  leetcode: LeetCodeIcon,
  codeforces: CodeforcesIcon,
  atcoder: AtCoderIcon,
  linkedin: LinkedInIcon,
  mail: MailIcon,
};
