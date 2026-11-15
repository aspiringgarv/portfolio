package dev.garv.portfolio.lab;

import dev.garv.portfolio.lab.PipelineResult.EventResult;
import dev.garv.portfolio.lab.PipelineResult.Outcome;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Simulates a consumer processing events against a flaky downstream. A failed attempt is retried with
 * exponential backoff (base * 2^retry); once retries run out the event goes to the dead-letter queue.
 * Same shape as a Kafka consumer with retries and a DLQ, but time is only computed, never slept.
 */
@Service
public class PipelineSimulator {
    private static final int MAX_WAIT_MS = 30_000;

    public PipelineResult run(PipelineRequest req) {
        Random rnd = new Random(req.seed() != null ? req.seed() : System.nanoTime());
        List<EventResult> results = new ArrayList<>(req.events());
        int first = 0, recovered = 0, dead = 0;

        for (int id = 1; id <= req.events(); id++) {
            List<Integer> waits = new ArrayList<>();
            int attempts = 0;
            boolean ok = false;
            int total = 0;
            while (true) {
                attempts++;
                if (rnd.nextDouble() >= req.failureRate()) { ok = true; break; }
                int retriesUsed = waits.size();
                if (retriesUsed >= req.maxRetries()) break;
                int wait = (int) Math.min(MAX_WAIT_MS, (long) req.baseDelayMs() << retriesUsed);
                waits.add(wait);
                total += wait;
            }
            Outcome outcome = !ok ? Outcome.DEAD_LETTER : attempts == 1 ? Outcome.DELIVERED : Outcome.RECOVERED;
            switch (outcome) {
                case DELIVERED -> first++;
                case RECOVERED -> recovered++;
                case DEAD_LETTER -> dead++;
            }
            results.add(new EventResult(id, attempts, outcome, waits, total));
        }
        int hadFailure = recovered + dead;
        double rate = hadFailure == 0 ? 1.0 : (double) recovered / hadFailure;
        return new PipelineResult(results, first, recovered, dead, Math.round(rate * 1000) / 1000.0);
    }
}
