/**
 * Avatar factory. A seed becomes a set of trait indexes, and the traits become a 16x16 pixel face.
 * Seeds starting with "t:" encode traits directly (that is what the avatar studio produces);
 * any other string is hashed into a random but repeatable set of traits.
 */
export interface PixelRect { x: number; y: number; w: number; h: number; fill: string }
export const GRID = 16;

export const SKIN = ['#ffdcb8', '#f4c19a', '#e8b98f', '#d99b6c', '#b87a4b', '#8d5a3a', '#6b4226', '#f7d6c4'];
export const HAIR = ['#14100c', '#2b1d12', '#4a3020', '#8a5a2b', '#d9a441', '#c43b3b', '#6c5ce7', '#2f9e8f', '#e0e0e0', '#ff6fae'];
export const ACCENT = ['#9dff5a', '#ff7a90', '#6ec6ff', '#ffd166', '#a79bff', '#5ee6c0', '#ff9f6e', '#e8ffe0'];
export const BG = ['#16211a', '#1d1a3d', '#2b1a1f', '#14262e', '#2a2616', '#1e2a1a', '#2a1f33', '#202020'];

export interface Traits {
  skin: number; hairStyle: number; hairColor: number; eyes: number; mouth: number;
  facial: number; accessory: number; clothing: number; shirt: number; bg: number;
}

export const TRAIT_DEFS: { key: keyof Traits; label: string; count: number; names?: string[] }[] = [
  { key: 'skin', label: 'skin', count: SKIN.length },
  { key: 'hairStyle', label: 'hair', count: 8, names: ['short', 'spiky', 'long', 'bun', 'mohawk', 'curly', 'bald', 'side part'] },
  { key: 'hairColor', label: 'hair color', count: HAIR.length },
  { key: 'eyes', label: 'eyes', count: 5, names: ['dots', 'wide', 'sleepy', 'wink', 'happy'] },
  { key: 'mouth', label: 'mouth', count: 4, names: ['smile', 'grin', 'neutral', 'open'] },
  { key: 'facial', label: 'facial hair', count: 3, names: ['none', 'beard', 'mustache'] },
  { key: 'accessory', label: 'accessory', count: 7, names: ['none', 'glasses', 'sunglasses', 'headphones', 'cap', 'beanie', 'headband'] },
  { key: 'clothing', label: 'outfit', count: 4, names: ['tee', 'hoodie', 'collar', 'jersey'] },
  { key: 'shirt', label: 'outfit color', count: ACCENT.length },
  { key: 'bg', label: 'background', count: BG.length },
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KEYS = TRAIT_DEFS.map((d) => d.key);

export function traitsFromSeed(seed: string): Traits {
  const m = /^t:([0-9a-z]{10})$/.exec(seed);
  const t = {} as Traits;
  if (m) {
    TRAIT_DEFS.forEach((d, i) => { t[d.key] = parseInt(m[1][i], 36) % d.count; });
    return t;
  }
  const r = rng(hash(seed || 'anon'));
  TRAIT_DEFS.forEach((d) => { t[d.key] = Math.floor(r() * d.count); });
  // keep the odd combinations rarer: most faces have no facial hair, a quarter wear an accessory
  if (r() < 0.6) t.facial = 0;
  if (r() < 0.35) t.accessory = 0;
  return t;
}

export const seedFromTraits = (t: Traits): string => 't:' + KEYS.map((k) => t[k].toString(36)).join('');
export const randomSeed = (): string => seedFromTraits(traitsFromSeed(Math.random().toString(36).slice(2)));

const DARK = '#14100c';
const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
};

export function buildAvatar(seed: string): PixelRect[] {
  const t = traitsFromSeed(seed);
  const skin = SKIN[t.skin], hair = HAIR[t.hairColor], shirt = ACCENT[t.shirt];
  const px: PixelRect[] = [];
  const add = (x: number, y: number, w: number, h: number, fill: string) => px.push({ x, y, w, h, fill });

  add(0, 0, 16, 16, BG[t.bg]);

  // outfit and neck
  add(2, 12, 12, 4, shirt);
  add(6, 11, 4, 1, shade(skin, 0.85));
  if (t.clothing === 0) add(7, 12, 2, 1, shade(skin, 0.85));
  if (t.clothing === 1) { add(5, 11, 6, 1, shade(shirt, 0.8)); add(6, 12, 1, 3, shade(shirt, 0.6)); add(9, 12, 1, 3, shade(shirt, 0.6)); }
  if (t.clothing === 2) { add(6, 11, 1, 2, '#ffffff'); add(9, 11, 1, 2, '#ffffff'); add(7, 12, 2, 4, shade(shirt, 0.7)); }
  if (t.clothing === 3) { add(2, 13, 12, 1, shade(shirt, 1.3)); add(2, 15, 12, 1, shade(shirt, 1.3)); }

  // head and ears
  add(3, 6, 1, 2, shade(skin, 0.92));
  add(12, 6, 1, 2, shade(skin, 0.92));
  add(4, 3, 8, 8, skin);

  // hair (behind accessories)
  switch (t.hairStyle) {
    case 0: add(4, 2, 8, 2, hair); add(4, 4, 1, 2, hair); add(11, 4, 1, 2, hair); break;
    case 1: add(4, 3, 8, 1, hair); add(4, 2, 2, 1, hair); add(7, 2, 2, 1, hair); add(10, 2, 2, 1, hair); add(4, 1, 1, 1, hair); add(8, 1, 1, 1, hair); add(11, 1, 1, 1, hair); break;
    case 2: add(4, 2, 8, 2, hair); add(3, 3, 1, 8, hair); add(12, 3, 1, 8, hair); add(4, 4, 1, 3, hair); add(11, 4, 1, 3, hair); break;
    case 3: add(4, 2, 8, 2, hair); add(4, 4, 1, 2, hair); add(11, 4, 1, 2, hair); add(7, 0, 2, 2, hair); break;
    case 4: add(7, 0, 2, 3, hair); add(7, 3, 2, 1, hair); add(6, 3, 1, 1, shade(hair, 0.8)); add(9, 3, 1, 1, shade(hair, 0.8)); break;
    case 5: add(3, 1, 10, 2, hair); add(3, 3, 2, 2, hair); add(11, 3, 2, 2, hair); add(5, 3, 6, 1, hair); break;
    case 7: add(4, 2, 8, 2, hair); add(4, 4, 2, 1, hair); add(4, 4, 1, 3, hair); add(11, 4, 1, 2, hair); break;
    default: break;
  }

  // eyes
  const e = t.eyes;
  if (e === 0) { add(6, 6, 1, 2, DARK); add(9, 6, 1, 2, DARK); }
  if (e === 1) { add(5, 6, 2, 2, '#ffffff'); add(9, 6, 2, 2, '#ffffff'); add(6, 7, 1, 1, DARK); add(9, 7, 1, 1, DARK); }
  if (e === 2) { add(5, 7, 2, 1, DARK); add(9, 7, 2, 1, DARK); }
  if (e === 3) { add(6, 6, 1, 2, DARK); add(9, 7, 2, 1, DARK); }
  if (e === 4) { add(5, 7, 1, 1, DARK); add(6, 6, 1, 1, DARK); add(7, 7, 1, 1, DARK); add(8, 7, 1, 1, DARK); add(9, 6, 1, 1, DARK); add(10, 7, 1, 1, DARK); }

  // facial hair and mouth
  if (t.facial === 1) add(4, 8, 8, 3, hair);
  if (t.facial === 2) add(6, 8, 4, 1, hair);
  const mouth = t.facial === 1 ? '#f4d6cc' : DARK;
  if (t.mouth === 0) { add(6, 9, 1, 1, mouth); add(9, 9, 1, 1, mouth); add(7, 10, 2, 1, mouth); }
  if (t.mouth === 1) { add(6, 9, 4, 2, mouth); add(7, 9, 2, 1, '#ffffff'); }
  if (t.mouth === 2) add(7, 10, 2, 1, mouth);
  if (t.mouth === 3) { add(7, 9, 2, 2, mouth); if (t.facial !== 1) add(7, 10, 2, 1, '#ff7a90'); }

  // accessories (on top)
  const acc = ACCENT[(t.shirt + 3) % ACCENT.length];
  switch (t.accessory) {
    case 1: add(5, 5, 3, 1, DARK); add(5, 7, 3, 1, DARK); add(5, 6, 1, 1, DARK); add(7, 6, 1, 1, DARK); add(8, 5, 3, 1, DARK); add(8, 7, 3, 1, DARK); add(8, 6, 1, 1, DARK); add(10, 6, 1, 1, DARK); break;
    case 2: add(5, 5, 6, 1, DARK); add(5, 6, 3, 2, '#101418'); add(8, 6, 3, 2, '#101418'); add(5, 6, 1, 1, '#4a5560'); add(8, 6, 1, 1, '#4a5560'); break;
    case 3: add(4, 1, 8, 1, '#2a2a2a'); add(3, 2, 1, 4, '#2a2a2a'); add(12, 2, 1, 4, '#2a2a2a'); add(2, 5, 2, 3, acc); add(12, 5, 2, 3, acc); break;
    case 4: add(4, 1, 8, 2, acc); add(2, 3, 10, 1, shade(acc, 0.7)); add(4, 3, 8, 1, acc); break;
    case 5: add(4, 1, 8, 3, acc); add(4, 3, 8, 1, shade(acc, 0.75)); add(7, 0, 2, 1, shade(acc, 1.2)); break;
    case 6: add(4, 3, 8, 1, acc); break;
    default: break;
  }
  return px;
}
