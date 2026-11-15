package dev.garv.portfolio.live;

import com.fasterxml.jackson.databind.JsonNode;
import dev.garv.portfolio.common.TextSanitizer;
import org.springframework.stereotype.Component;

@Component
public class MoveCommand implements LiveCommand {
    private final LiveRegistry registry;

    public MoveCommand(LiveRegistry registry) {
        this.registry = registry;
    }

    @Override public String type() { return "move"; }

    /** x is a 0..1 fraction of page width, y is page pixels, so cursors line up across screen sizes. */
    @Override
    public void handle(Peer from, JsonNode msg) {
        if (!from.allowMove(40)) return;
        double x = clamp(msg.path("x").asDouble(-1), 0, 1);
        double y = clamp(msg.path("y").asDouble(-1), 0, 100_000);
        if (x < 0 || y < 0) return;
        String page = TextSanitizer.clean(msg.path("p").asText("/"), 40);
        registry.broadcast(registry.node().put("t", "move").put("id", from.id()).put("x", x).put("y", y).put("p", page), from.id());
    }

    private static double clamp(double v, double lo, double hi) {
        return Double.isNaN(v) ? -1 : Math.max(lo, Math.min(hi, v));
    }
}
