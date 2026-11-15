package dev.garv.portfolio.lab;

import java.util.List;

public record PathfindResult(boolean found, List<Integer> visited, List<Integer> path, int cost, int visitedCount) {}
