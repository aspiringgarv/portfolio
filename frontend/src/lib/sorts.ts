/** Sorting algorithms as generators. Each mutates `a` in place and yields what it just touched,
 *  so the UI can animate one step at a time and count comparisons and writes. */
export type Op = { kind: 'cmp' | 'write'; i: number; j?: number };
export type Sorter = (a: number[]) => Generator<Op, void, void>;

function* bubble(a: number[]): Generator<Op> {
  for (let n = a.length; n > 1; n--) {
    let swapped = false;
    for (let i = 1; i < n; i++) {
      yield { kind: 'cmp', i: i - 1, j: i };
      if (a[i - 1] > a[i]) { [a[i - 1], a[i]] = [a[i], a[i - 1]]; swapped = true; yield { kind: 'write', i: i - 1, j: i }; }
    }
    if (!swapped) return;
  }
}

function* insertion(a: number[]): Generator<Op> {
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0) {
      yield { kind: 'cmp', i: j, j: i };
      if (a[j] <= x) break;
      a[j + 1] = a[j];
      yield { kind: 'write', i: j + 1 };
      j--;
    }
    a[j + 1] = x;
    yield { kind: 'write', i: j + 1 };
  }
}

function* selection(a: number[]): Generator<Op> {
  for (let i = 0; i < a.length - 1; i++) {
    let m = i;
    for (let j = i + 1; j < a.length; j++) {
      yield { kind: 'cmp', i: m, j };
      if (a[j] < a[m]) m = j;
    }
    if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; yield { kind: 'write', i, j: m }; }
  }
}

function* merge(a: number[]): Generator<Op> {
  const aux = a.slice();
  function* go(lo: number, hi: number): Generator<Op> {
    if (hi - lo < 1) return;
    const mid = (lo + hi) >> 1;
    yield* go(lo, mid);
    yield* go(mid + 1, hi);
    for (let k = lo; k <= hi; k++) aux[k] = a[k];
    let i = lo, j = mid + 1;
    for (let k = lo; k <= hi; k++) {
      if (i > mid) a[k] = aux[j++];
      else if (j > hi) a[k] = aux[i++];
      else { yield { kind: 'cmp', i, j }; a[k] = aux[j] < aux[i] ? aux[j++] : aux[i++]; }
      yield { kind: 'write', i: k };
    }
  }
  yield* go(0, a.length - 1);
}

function* quick(a: number[]): Generator<Op> {
  function* go(lo: number, hi: number): Generator<Op> {
    if (lo >= hi) return;
    const p = a[hi];
    let s = lo;
    for (let i = lo; i < hi; i++) {
      yield { kind: 'cmp', i, j: hi };
      if (a[i] < p) { if (i !== s) { [a[i], a[s]] = [a[s], a[i]]; yield { kind: 'write', i, j: s }; } s++; }
    }
    [a[s], a[hi]] = [a[hi], a[s]];
    yield { kind: 'write', i: s, j: hi };
    yield* go(lo, s - 1);
    yield* go(s + 1, hi);
  }
  yield* go(0, a.length - 1);
}

function* heap(a: number[]): Generator<Op> {
  const n = a.length;
  function* sift(root: number, end: number): Generator<Op> {
    for (;;) {
      let big = root;
      const l = 2 * root + 1, r = l + 1;
      if (l < end) { yield { kind: 'cmp', i: big, j: l }; if (a[l] > a[big]) big = l; }
      if (r < end) { yield { kind: 'cmp', i: big, j: r }; if (a[r] > a[big]) big = r; }
      if (big === root) return;
      [a[root], a[big]] = [a[big], a[root]];
      yield { kind: 'write', i: root, j: big };
      root = big;
    }
  }
  for (let i = (n >> 1) - 1; i >= 0; i--) yield* sift(i, n);
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    yield { kind: 'write', i: 0, j: end };
    yield* sift(0, end);
  }
}

export const SORTS: { name: string; best: string; avg: string; note: string; run: Sorter }[] = [
  { name: 'bubble', best: 'n', avg: 'n²', note: 'Swaps neighbours until nothing moves.', run: bubble },
  { name: 'selection', best: 'n²', avg: 'n²', note: 'Finds the minimum, drops it at the front.', run: selection },
  { name: 'insertion', best: 'n', avg: 'n²', note: 'Grows a sorted prefix; great on nearly sorted input.', run: insertion },
  { name: 'merge', best: 'n log n', avg: 'n log n', note: 'Splits in half, sorts, merges. Needs extra memory.', run: merge },
  { name: 'quick', best: 'n log n', avg: 'n log n', note: 'Partitions around a pivot, recurses on both sides.', run: quick },
  { name: 'heap', best: 'n log n', avg: 'n log n', note: 'Builds a max-heap, repeatedly pops the max.', run: heap },
];

export type Pattern = 'random' | 'reversed' | 'nearly sorted' | 'few unique';
export function makeData(n: number, pattern: Pattern): number[] {
  const base = Array.from({ length: n }, (_, i) => i + 1);
  if (pattern === 'reversed') return base.reverse();
  if (pattern === 'nearly sorted') {
    for (let k = 0; k < Math.max(2, n >> 4); k++) { const i = Math.floor(Math.random() * n), j = Math.floor(Math.random() * n); [base[i], base[j]] = [base[j], base[i]]; }
    return base;
  }
  if (pattern === 'few unique') return base.map(() => (1 + Math.floor(Math.random() * 4)) * (n / 4));
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
  return base;
}
