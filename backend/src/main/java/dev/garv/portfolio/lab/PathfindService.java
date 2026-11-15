package dev.garv.portfolio.lab;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.PriorityQueue;

/** Grid shortest-path search. BFS ignores weights; Dijkstra and A* (Manhattan heuristic) honour them. */
@Service
public class PathfindService {
    private static final int[] DR = {-1, 1, 0, 0};
    private static final int[] DC = {0, 0, -1, 1};

    public PathfindResult solve(PathfindRequest req) {
        int rows = req.rows(), cols = req.cols(), n = rows * cols;
        if (req.cells().size() != n) bad("cells must contain rows * cols entries.");
        if (req.start() >= n || req.end() >= n) bad("start and end must be inside the grid.");
        int[] cells = req.cells().stream().mapToInt(Integer::intValue).toArray();
        for (int c : cells) if (c != -1 && (c < 1 || c > 9)) bad("cell values must be -1 or 1..9.");
        if (cells[req.start()] == -1 || cells[req.end()] == -1) bad("start and end cannot be walls.");

        return switch (req.algorithm()) {
            case BFS -> bfs(cells, rows, cols, req.start(), req.end());
            case DIJKSTRA -> weighted(cells, rows, cols, req.start(), req.end(), false);
            case ASTAR -> weighted(cells, rows, cols, req.start(), req.end(), true);
        };
    }

    private PathfindResult bfs(int[] cells, int rows, int cols, int s, int e) {
        int n = cells.length;
        int[] prev = new int[n];
        Arrays.fill(prev, -2);
        prev[s] = -1;
        ArrayDeque<Integer> q = new ArrayDeque<>();
        q.add(s);
        List<Integer> visited = new ArrayList<>();
        while (!q.isEmpty()) {
            int cur = q.poll();
            visited.add(cur);
            if (cur == e) break;
            for (int nb : neighbours(cur, rows, cols)) {
                if (cells[nb] == -1 || prev[nb] != -2) continue;
                prev[nb] = cur;
                q.add(nb);
            }
        }
        return result(cells, prev, visited, s, e);
    }

    private PathfindResult weighted(int[] cells, int rows, int cols, int s, int e, boolean astar) {
        int n = cells.length;
        int[] dist = new int[n];
        int[] prev = new int[n];
        boolean[] done = new boolean[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        Arrays.fill(prev, -2);
        dist[s] = 0;
        prev[s] = -1;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));
        pq.add(new int[]{s, astar ? h(s, e, cols) : 0});
        List<Integer> visited = new ArrayList<>();
        while (!pq.isEmpty()) {
            int cur = pq.poll()[0];
            if (done[cur]) continue;
            done[cur] = true;
            visited.add(cur);
            if (cur == e) break;
            for (int nb : neighbours(cur, rows, cols)) {
                if (cells[nb] == -1 || done[nb]) continue;
                int nd = dist[cur] + cells[nb];
                if (nd < dist[nb]) {
                    dist[nb] = nd;
                    prev[nb] = cur;
                    pq.add(new int[]{nb, nd + (astar ? h(nb, e, cols) : 0)});
                }
            }
        }
        return result(cells, prev, visited, s, e);
    }

    private static int h(int a, int b, int cols) {
        return Math.abs(a / cols - b / cols) + Math.abs(a % cols - b % cols);
    }

    private static List<Integer> neighbours(int cur, int rows, int cols) {
        List<Integer> out = new ArrayList<>(4);
        int r = cur / cols, c = cur % cols;
        for (int i = 0; i < 4; i++) {
            int nr = r + DR[i], nc = c + DC[i];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.add(nr * cols + nc);
        }
        return out;
    }

    private static PathfindResult result(int[] cells, int[] prev, List<Integer> visited, int s, int e) {
        if (prev[e] == -2) return new PathfindResult(false, visited, List.of(), 0, visited.size());
        List<Integer> path = new ArrayList<>();
        for (int at = e; at != -1; at = prev[at]) path.add(at);
        Collections.reverse(path);
        int cost = path.stream().skip(1).mapToInt(i -> cells[i]).sum();
        return new PathfindResult(true, visited, path, cost, visited.size());
    }

    private static void bad(String msg) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }
}
