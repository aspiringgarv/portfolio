package dev.garv.portfolio.stats;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatService {
    private static final long ROW = 1L;
    private final StatRepository repo;

    public StatService(StatRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public long visits() {
        return repo.findById(ROW).map(Stat::getVisits).orElse(0L);
    }

    /** Single-instance app, so serialising the increment is enough. */
    @Transactional
    public synchronized long recordVisit() {
        Stat s = repo.findById(ROW).orElseGet(() -> new Stat(0));
        s.increment();
        return repo.save(s).getVisits();
    }
}
