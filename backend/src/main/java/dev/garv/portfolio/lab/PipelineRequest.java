package dev.garv.portfolio.lab;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record PipelineRequest(
        @Min(1) @Max(100) int events,
        @DecimalMin("0.0") @DecimalMax("0.95") double failureRate,
        @Min(0) @Max(8) int maxRetries,
        @Min(10) @Max(1000) int baseDelayMs,
        Long seed) {}
