/**
 * Rubik's cube as 26 cubies. Each cubie has an integer position p in {-1,0,1}^3 and an integer rotation
 * matrix R (its orientation). World axes: x right, y up, z toward the viewer (front face).
 * A move rotates every cubie in one layer by 90 degrees; no lookup tables, just geometry.
 */
export type Vec = [number, number, number];
export type Mat = number[][];
export type FaceLetter = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
export interface Move { face: FaceLetter; dir: 1 | -1 | 2 }
export interface Cubie { id: number; init: Vec; p: Vec; R: Mat }

export const FACE_ORDER: FaceLetter[] = ['U', 'R', 'F', 'D', 'L', 'B'];
export const FACE_NORMAL: Record<FaceLetter, Vec> = {
  U: [0, 1, 0], D: [0, -1, 0], R: [1, 0, 0], L: [-1, 0, 0], F: [0, 0, 1], B: [0, 0, -1],
};
export const SOLVED = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';

const IDENT: Mat = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const dot = (a: ArrayLike<number>, b: ArrayLike<number>) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const mul = (A: Mat, B: Mat): Mat => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
const transpose = (A: Mat): Mat => [0, 1, 2].map((i) => [0, 1, 2].map((j) => A[j][i]));
const mulVec = (A: Mat, v: Vec): Vec => [dot(A[0], v), dot(A[1], v), dot(A[2], v)];
const crossMat = (n: Vec): Mat => [[0, -n[2], n[1]], [n[2], 0, -n[0]], [-n[1], n[0], 0]];
const vecKey = (v: ArrayLike<number>) => `${v[0]},${v[1]},${v[2]}`;

/** Clockwise quarter turn as seen from outside the face: -90 degrees about the outward normal. */
function quarterCW(n: Vec): Mat {
  const c = crossMat(n);
  return [0, 1, 2].map((i) => [0, 1, 2].map((j) => n[i] * n[j] - c[i][j]));
}

const LETTER_BY_NORMAL = new Map<string, FaceLetter>(FACE_ORDER.map((f) => [vecKey(FACE_NORMAL[f]), f]));

export function solvedCube(): Cubie[] {
  const out: Cubie[] = [];
  let id = 0;
  for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) for (const z of [-1, 0, 1]) {
    if (x === 0 && y === 0 && z === 0) continue;
    out.push({ id: id++, init: [x, y, z], p: [x, y, z], R: IDENT });
  }
  return out;
}

export const inLayer = (c: Cubie, face: FaceLetter) => dot(c.p, FACE_NORMAL[face]) === 1;

export function applyMove(cubies: Cubie[], m: Move): Cubie[] {
  const n = FACE_NORMAL[m.face];
  const q = quarterCW(n);
  const rot = m.dir === 1 ? q : m.dir === -1 ? transpose(q) : mul(q, q);
  return cubies.map((c) => (inLayer(c, m.face) ? { ...c, p: mulVec(rot, c.p), R: mul(rot, c.R) } : c));
}

export function applyMoves(cubies: Cubie[], moves: Move[]): Cubie[] {
  return moves.reduce(applyMove, cubies);
}

export function parseMoves(text: string): Move[] {
  return text.trim().split(/\s+/).filter(Boolean).map((t) => {
    const face = t[0] as FaceLetter;
    if (!FACE_ORDER.includes(face)) throw new Error(`bad move ${t}`);
    return { face, dir: t[1] === "'" ? -1 : t[1] === '2' ? 2 : 1 };
  });
}

export const moveName = (m: Move) => m.face + (m.dir === -1 ? "'" : m.dir === 2 ? '2' : '');
export const inverse = (m: Move): Move => ({ face: m.face, dir: m.dir === 2 ? 2 : m.dir === 1 ? -1 : 1 });

export function randomScramble(length = 20): Move[] {
  const out: Move[] = [];
  const axis = (f: FaceLetter) => 'UD'.includes(f) ? 0 : 'RL'.includes(f) ? 1 : 2;
  while (out.length < length) {
    const face = FACE_ORDER[Math.floor(Math.random() * 6)];
    const last = out[out.length - 1];
    if (last && (last.face === face || (axis(last.face) === axis(face) && out.length > 1 && axis(out[out.length - 2].face) === axis(face)))) continue;
    out.push({ face, dir: ([1, -1, 2] as const)[Math.floor(Math.random() * 3)] });
  }
  return out;
}

/** Sticker letter showing on a cubie's local face (local normal), or null for an interior face. */
export function stickerAt(c: Cubie, localNormal: Vec): FaceLetter | null {
  return dot(c.init, localNormal) === 1 ? (LETTER_BY_NORMAL.get(vecKey(localNormal)) ?? null) : null;
}

// Position of sticker (row r, col c) on each face, matching the Kociemba facelet net.
const FACELET_POS: Record<FaceLetter, (r: number, c: number) => Vec> = {
  U: (r, c) => [-1 + c, 1, -1 + r],
  R: (r, c) => [1, 1 - r, 1 - c],
  F: (r, c) => [-1 + c, 1 - r, 1],
  D: (r, c) => [-1 + c, -1, 1 - r],
  L: (r, c) => [-1, 1 - r, -1 + c],
  B: (r, c) => [1 - c, 1 - r, -1],
};

/** 54-character facelet string in U R F D L B order, the input format of the two-phase solver. */
export function toFacelets(cubies: Cubie[]): string {
  const at = new Map(cubies.map((c) => [vecKey(c.p), c]));
  let s = '';
  for (const face of FACE_ORDER) {
    const w = FACE_NORMAL[face];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const cubie = at.get(vecKey(FACELET_POS[face](r, c)))!;
      s += stickerAt(cubie, mulVec(transpose(cubie.R), w)) ?? '?';
    }
  }
  return s;
}

export const isSolved = (cubies: Cubie[]) => toFacelets(cubies) === SOLVED;

// ---- rendering math (CSS uses y down, so conjugate by diag(1,-1,1)) ----
type Mat4 = number[][];
const mul4 = (A: Mat4, B: Mat4): Mat4 => A.map((_, i) => B[0].map((__, j) => A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j] + A[i][3] * B[3][j]));

function rotationAbout(n: Vec, phi: number): Mat4 {
  const c = Math.cos(phi), s = Math.sin(phi), k = crossMat(n);
  const r = [0, 1, 2].map((i) => [0, 1, 2].map((j) => c * (i === j ? 1 : 0) + s * k[i][j] + (1 - c) * n[i] * n[j]));
  return [[...r[0], 0], [...r[1], 0], [...r[2], 0], [0, 0, 0, 1]];
}

export interface Anim { face: FaceLetter; dir: 1 | -1 | 2; t: number }

export function cubieCss(c: Cubie, size: number, anim: Anim | null): string {
  const body: Mat4 = [[...c.R[0], c.p[0] * size], [...c.R[1], c.p[1] * size], [...c.R[2], c.p[2] * size], [0, 0, 0, 1]];
  let m = body;
  if (anim && inLayer(c, anim.face)) m = mul4(rotationAbout(FACE_NORMAL[anim.face], -anim.dir * (Math.PI / 2) * anim.t), body);
  const sg = (i: number) => (i === 1 ? -1 : 1);
  const cols: number[] = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) cols.push(m[i][j] * sg(i) * sg(j));
  return `matrix3d(${cols.map((v) => Math.round(v * 1e6) / 1e6).join(',')})`;
}
