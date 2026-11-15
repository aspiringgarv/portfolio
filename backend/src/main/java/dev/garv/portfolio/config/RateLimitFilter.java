package dev.garv.portfolio.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Sliding-window, per-IP limiter for the write endpoints. */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(int max, Duration window) {}

    private static final Map<String, Rule> RULES = Map.of(
            "/api/contact", new Rule(5, Duration.ofMinutes(10)),
            "/api/guestbook", new Rule(3, Duration.ofMinutes(10)),
            "/api/visit", new Rule(30, Duration.ofMinutes(1)));

    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        return !"POST".equals(req.getMethod()) || !RULES.containsKey(req.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        Rule rule = RULES.get(req.getRequestURI());
        String key = req.getRemoteAddr() + "|" + req.getRequestURI();
        long now = System.currentTimeMillis();
        Deque<Long> q = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        boolean allowed;
        synchronized (q) {
            while (!q.isEmpty() && now - q.peekFirst() > rule.window().toMillis()) q.pollFirst();
            allowed = q.size() < rule.max();
            if (allowed) q.addLast(now);
        }
        if (hits.size() > 10_000) hits.clear(); // crude memory guard
        if (!allowed) {
            res.setStatus(429);
            res.setContentType("application/json");
            res.getWriter().write("{\"error\":\"Slow down a little and try again soon.\"}");
            return;
        }
        chain.doFilter(req, res);
    }
}
