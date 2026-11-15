package dev.garv.portfolio;

import dev.garv.portfolio.lab.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LabTest {
    @Test void pipelineIsDeterministicAndAccountsForEveryEvent() {
        var sim = new PipelineSimulator();
        var req = new PipelineRequest(60, 0.4, 3, 100, 42L);
        var a = sim.run(req);
        var b = sim.run(req);
        assertEquals(a, b);
        assertEquals(60, a.deliveredFirstTry() + a.recovered() + a.deadLettered());
        a.events().stream().filter(e -> !e.backoffMs().isEmpty())
                .forEach(e -> assertEquals(100, e.backoffMs().get(0)));
    }

    @Test void backoffDoublesEachRetry() {
        var res = new PipelineSimulator().run(new PipelineRequest(100, 0.95, 4, 50, 7L));
        var e = res.events().stream().filter(x -> x.backoffMs().size() == 4).findFirst().orElseThrow();
        assertEquals(List.of(50, 100, 200, 400), e.backoffMs());
        assertEquals(PipelineResult.Outcome.DEAD_LETTER, e.outcome());
    }

    @Test void noFailuresMeansEverythingDeliversFirstTry() {
        var res = new PipelineSimulator().run(new PipelineRequest(30, 0.0, 3, 100, 1L));
        assertEquals(30, res.deliveredFirstTry());
        assertEquals(1.0, res.recoveryRate());
    }

    @Test void paymentStateMachineRejectsIllegalTransitions() {
        var lab = new PaymentLab();
        var t = lab.apply(PaymentLab.Status.CREATED, PaymentLab.Event.AUTHORIZE_ATTEMPT);
        assertEquals(PaymentLab.Status.AUTHORIZING, t.to());
        assertThrows(ResponseStatusException.class,
                () -> lab.apply(PaymentLab.Status.CREATED, PaymentLab.Event.CAPTURE_SUCCESS));
        assertEquals(17, lab.table().size());
    }

    private PathfindRequest grid(int rows, int cols, List<Integer> cells, PathfindRequest.Algorithm alg) {
        return new PathfindRequest(rows, cols, cells, 0, rows * cols - 1, alg);
    }

    @Test void allAlgorithmsFindShortestStepsOnOpenGrid() {
        var svc = new PathfindService();
        List<Integer> open = Collections.nCopies(25, 1);
        for (var alg : PathfindRequest.Algorithm.values()) {
            var r = svc.solve(grid(5, 5, open, alg));
            assertTrue(r.found());
            assertEquals(9, r.path().size()); // 8 steps, 9 cells
            assertEquals(8, r.cost());
        }
    }

    @Test void dijkstraAvoidsMudThatBfsWalksThrough() {
        // 3x3: top row after the start is mud (cost 9); the straight route costs 18, the detour 12
        List<Integer> cells = List.of(
                1, 9, 9,
                1, 1, 1,
                1, 1, 1);
        var svc = new PathfindService();
        var req = new PathfindRequest(3, 3, cells, 0, 2, PathfindRequest.Algorithm.DIJKSTRA);
        var d = svc.solve(req);
        assertEquals(12, d.cost()); // down, right, right (1+1+1) then up into the mud end cell (9)
        var a = svc.solve(new PathfindRequest(3, 3, cells, 0, 2, PathfindRequest.Algorithm.ASTAR));
        assertEquals(d.cost(), a.cost());
        var b = svc.solve(new PathfindRequest(3, 3, cells, 0, 2, PathfindRequest.Algorithm.BFS));
        assertTrue(b.cost() > d.cost());
    }

    @Test void unreachableEndReportsNotFound() {
        List<Integer> cells = List.of(1, -1, 1, -1, -1, -1, 1, -1, 1);
        var r = new PathfindService().solve(new PathfindRequest(3, 3, cells, 0, 8, PathfindRequest.Algorithm.ASTAR));
        assertFalse(r.found());
    }
}
