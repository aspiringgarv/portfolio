package dev.garv.portfolio.stats;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Stat {
    @Id
    private Long id = 1L;
    private long visits;

    protected Stat() {}

    public Stat(long visits) {
        this.visits = visits;
    }

    public long getVisits() { return visits; }
    public void increment() { visits++; }
}
