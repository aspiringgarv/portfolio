package dev.garv.portfolio.live;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class ReactCommand implements LiveCommand {
    private static final Set<String> ALLOWED = Set.of("👋", "🔥", "❤️", "🚀", "😂", "👏");
    private final LiveRegistry registry;

    public ReactCommand(LiveRegistry registry) {
        this.registry = registry;
    }

    @Override public String type() { return "react"; }

    @Override
    public void handle(Peer from, JsonNode msg) {
        String emoji = msg.path("emoji").asText("");
        if (!ALLOWED.contains(emoji)) return;
        registry.broadcast(registry.node().put("t", "react").put("id", from.id()).put("emoji", emoji)
                .put("x", msg.path("x").asDouble(0.5)).put("y", msg.path("y").asDouble(0)), from.id());
    }
}
