package dev.garv.portfolio.live;

import com.fasterxml.jackson.databind.JsonNode;
import dev.garv.portfolio.common.TextSanitizer;
import org.springframework.stereotype.Component;

@Component
public class ProfileCommand implements LiveCommand {
    private final LiveRegistry registry;

    public ProfileCommand(LiveRegistry registry) {
        this.registry = registry;
    }

    @Override public String type() { return "profile"; }

    @Override
    public void handle(Peer from, JsonNode msg) {
        String name = TextSanitizer.clean(msg.path("name").asText(""), 24);
        String seed = TextSanitizer.clean(msg.path("seed").asText(""), 40);
        if (name.isEmpty()) name = from.name();
        if (seed.isEmpty()) seed = from.seed();
        from.rename(name, seed);
        registry.broadcast(registry.node().put("t", "profile").put("id", from.id())
                .put("name", from.name()).put("seed", from.seed()), from.id());
    }
}
