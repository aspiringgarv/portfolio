export interface Trick {
  title: string;
  when: string;
  idea: string;
  complexity: string;
  practice: string;
  code: string;
}

/** Contest-style techniques, written the way I'd write them in Java. */
export const TRICKS: Trick[] = [
  {
    title: 'Binary search on the answer',
    when: 'Problems that ask to minimise a maximum or maximise a minimum, where you can check "is x enough?" quickly.',
    idea: 'If feasibility is monotonic (false, false, ..., true, true), you can binary search the answer itself instead of searching an array. Write the check first, then wrap it in the loop.',
    complexity: 'O(log(range) × cost of the check)',
    practice: 'LeetCode 1011 Capacity To Ship Packages Within D Days',
    code: `// smallest x in [lo, hi] where ok(x) is true
int lo = 0, hi = MAX;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (ok(mid)) hi = mid;
    else lo = mid + 1;
}
// answer: lo`,
  },
  {
    title: 'Sliding window (two pointers)',
    when: 'Subarray or substring questions with a condition that only gets easier to break as the window grows, such as positive numbers with a sum limit.',
    idea: 'Grow the right end every step. While the window is valid, record it and shrink from the left. Each index enters and leaves once, so the nested loop is still linear. It needs non-negative values: with negatives, shrinking no longer reliably reduces the sum.',
    complexity: 'O(n)',
    practice: 'LeetCode 209 Minimum Size Subarray Sum',
    code: `// shortest subarray with sum >= k (all a[i] > 0)
int best = Integer.MAX_VALUE, sum = 0;
for (int l = 0, r = 0; r < n; r++) {
    sum += a[r];
    while (sum >= k) {
        best = Math.min(best, r - l + 1);
        sum -= a[l++];
    }
}`,
  },
  {
    title: 'Prefix sums and difference arrays',
    when: 'Many range-sum queries, or many "add v to a range" updates followed by one read.',
    idea: 'Prefix sums turn any range sum into one subtraction. A difference array is the reverse: mark where an addition starts and stops, then take one prefix sum at the end to apply all updates at once.',
    complexity: 'O(n) to build, O(1) per query or update',
    practice: 'LeetCode 370 Range Addition',
    code: `long[] pre = new long[n + 1];
for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
long sum = pre[r + 1] - pre[l];      // a[l..r]

// add v to a[l..r] in O(1); diff has n + 1 slots
diff[l] += v;
diff[r + 1] -= v;
// finally: a[i] = diff[0] + ... + diff[i]`,
  },
  {
    title: 'Monotonic stack',
    when: 'For each element, find the next greater or smaller element, or the nearest one on a side.',
    idea: 'Keep a stack of indices whose values are in order. When a new value breaks the order, it is the answer for everything it pops. Every index is pushed once and popped once.',
    complexity: 'O(n)',
    practice: 'LeetCode 739 Daily Temperatures',
    code: `int[] next = new int[n];
Arrays.fill(next, -1);
Deque<Integer> st = new ArrayDeque<>();   // values decreasing
for (int i = 0; i < n; i++) {
    while (!st.isEmpty() && a[st.peek()] < a[i])
        next[st.pop()] = i;               // a[i] is their next greater
    st.push(i);
}`,
  },
  {
    title: 'Bit tricks and subset enumeration',
    when: 'Small sets (n up to about 20) that you can represent as a bitmask, or any "lowest set bit" logic.',
    idea: 'x & -x isolates the lowest set bit, and x & (x - 1) removes it. The loop below visits every non-empty subset of a mask. Run over all masks it costs 3^n in total, much less than checking 2^n × 2^n pairs.',
    complexity: 'O(1) per trick, O(2^k) for the subsets of a k-bit mask',
    practice: 'LeetCode 191 Number of 1 Bits, 78 Subsets',
    code: `int lowest = x & -x;                 // isolate lowest set bit
x &= x - 1;                          // clear lowest set bit
boolean pow2 = x > 0 && (x & (x - 1)) == 0;

for (int s = mask; s > 0; s = (s - 1) & mask) {
    // s is every non-empty subset of mask
}`,
  },
  {
    title: 'Union-Find (disjoint set union)',
    when: 'Connectivity questions where edges arrive over time, cycle detection, or Kruskal\'s minimum spanning tree.',
    idea: 'Each set is a tree with a root. Path compression flattens trees during find, and union by size keeps them shallow. Together the cost per operation is nearly constant (inverse Ackermann).',
    complexity: 'about O(α(n)) per operation',
    practice: 'LeetCode 547 Number of Provinces',
    code: `int find(int x) { return p[x] == x ? x : (p[x] = find(p[x])); }

boolean union(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;           // already connected
    if (sz[a] < sz[b]) { int t = a; a = b; b = t; }
    p[b] = a; sz[a] += sz[b];
    return true;
}`,
  },
  {
    title: '0-1 BFS',
    when: 'Shortest path where every edge costs exactly 0 or 1.',
    idea: 'Dijkstra needs a priority queue only to order costs. With just 0 and 1 you can use a deque: push zero-cost neighbours to the front and one-cost neighbours to the back, so the deque stays sorted by distance.',
    complexity: 'O(V + E), versus O(E log V) for Dijkstra',
    practice: 'LeetCode 1368 Minimum Cost to Make at Least One Valid Path in a Grid',
    code: `Deque<Integer> dq = new ArrayDeque<>();
dist[s] = 0; dq.add(s);
while (!dq.isEmpty()) {
    int u = dq.pollFirst();
    for (int[] e : adj[u]) {            // e = {v, w}, w is 0 or 1
        int v = e[0], nd = dist[u] + e[1];
        if (nd < dist[v]) {
            dist[v] = nd;
            if (e[1] == 0) dq.addFirst(v); else dq.addLast(v);
        }
    }
}`,
  },
  {
    title: 'Fast power and modular inverse',
    when: 'Counting problems that ask for an answer modulo a prime, such as 10^9 + 7, especially with division or combinations.',
    idea: 'Square the base and halve the exponent, so a^e takes log e multiplications. For a prime modulus p, Fermat\'s little theorem gives the inverse of a as a^(p-2). Keep the modulus below 2^31 so a product fits in a long.',
    complexity: 'O(log e)',
    practice: 'LeetCode 50 Pow(x, n)',
    code: `long pow(long b, long e, long m) {
    long r = 1; b %= m;
    for (; e > 0; e >>= 1, b = b * b % m)
        if ((e & 1) == 1) r = r * b % m;
    return r;
}
long inv(long a, long p) { return pow(a, p - 2, p); }  // p prime`,
  },
];
