package dev.garv.portfolio.stats;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class StatController {
    private final StatService service;

    public StatController(StatService service) {
        this.service = service;
    }

    @PostMapping("/visit")
    public Map<String, Long> visit() {
        return Map.of("visits", service.recordVisit());
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        return Map.of("visits", service.visits());
    }
}
