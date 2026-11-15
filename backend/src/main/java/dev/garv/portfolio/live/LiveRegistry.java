package dev.garv.portfolio.live;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Observer hub: owns the set of connected peers and fans messages out to them. */
@Component
public class LiveRegistry {
    private static final Logger log = LoggerFactory.getLogger(LiveRegistry.class);
    static final int MAX_PEERS = 200;

    private final Map<String, Peer> peers = new ConcurrentHashMap<>();
    private final ObjectMapper mapper;

    public LiveRegistry(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public ObjectNode node() { return mapper.createObjectNode(); }

    public boolean add(Peer p) {
        if (peers.size() >= MAX_PEERS) return false;
        peers.put(p.id(), p);
        return true;
    }

    public void remove(String id) { peers.remove(id); }
    public Peer get(String id) { return peers.get(id); }
    public int online() { return peers.size(); }

    public ObjectNode describe(Peer p) {
        return node().put("id", p.id()).put("name", p.name()).put("color", p.color()).put("seed", p.seed());
    }

    public ArrayNode describeAllExcept(String id) {
        ArrayNode arr = mapper.createArrayNode();
        peers.values().stream().filter(p -> !p.id().equals(id)).forEach(p -> arr.add(describe(p)));
        return arr;
    }

    public void send(Peer to, ObjectNode msg) {
        try {
            if (to.session().isOpen()) to.session().sendMessage(new TextMessage(mapper.writeValueAsString(msg)));
        } catch (IOException | IllegalStateException e) {
            log.debug("Dropping peer {}: {}", to.id(), e.getMessage());
        }
    }

    public void broadcast(ObjectNode msg, String exceptId) {
        peers.values().stream().filter(p -> !p.id().equals(exceptId)).forEach(p -> send(p, msg));
    }
}
