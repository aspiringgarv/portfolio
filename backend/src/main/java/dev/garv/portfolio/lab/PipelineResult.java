package dev.garv.portfolio.lab;

import java.util.List;

public record PipelineResult(List<EventResult> events, int deliveredFirstTry, int recovered, int deadLettered, double recoveryRate) {
    public enum Outcome { DELIVERED, RECOVERED, DEAD_LETTER }

    /** backoffMs holds the wait before each retry, in order. */
    public record EventResult(int id, int attempts, Outcome outcome, List<Integer> backoffMs, int totalWaitMs) {}
}
