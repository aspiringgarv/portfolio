package dev.garv.portfolio.lab;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** cells is row-major: -1 wall, 1 normal, 2..9 weighted ("mud"). */
public record PathfindRequest(
        @Min(2) @Max(60) int rows,
        @Min(2) @Max(60) int cols,
        @NotNull @Size(min = 4, max = 3600) List<Integer> cells,
        @Min(0) int start,
        @Min(0) int end,
        @NotNull Algorithm algorithm) {
    public enum Algorithm { BFS, DIJKSTRA, ASTAR }
}
