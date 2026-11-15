package dev.garv.portfolio.live;

import org.springframework.web.socket.WebSocketSession;

/** One connected visitor. Mutable fields are only touched from that visitor's own socket thread. */
public class Peer {
    private final String id;
    private final String color;
    private final WebSocketSession session;
    private String name;
    private String seed;
    private long lastMoveAt;

    public Peer(String id, String color, String seed, WebSocketSession session) {
        this.id = id;
        this.color = color;
        this.seed = seed;
        this.name = "visitor-" + id.substring(0, 3);
        this.session = session;
    }

    public String id() { return id; }
    public String color() { return color; }
    public String name() { return name; }
    public String seed() { return seed; }
    public WebSocketSession session() { return session; }
    public void rename(String name, String seed) { this.name = name; this.seed = seed; }

    /** True at most once per {@code minGapMs}; used to throttle cursor floods. */
    public boolean allowMove(long minGapMs) {
        long now = System.currentTimeMillis();
        if (now - lastMoveAt < minGapMs) return false;
        lastMoveAt = now;
        return true;
    }
}
