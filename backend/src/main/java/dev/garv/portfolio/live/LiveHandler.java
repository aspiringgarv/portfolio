package dev.garv.portfolio.live;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class LiveHandler extends TextWebSocketHandler {
    private static final String[] COLORS = {"#9dff5a", "#5ee6c0", "#ffd166", "#ff7a90", "#a79bff", "#6ec6ff", "#ff9f6e"};

    private final LiveRegistry registry;
    private final ObjectMapper mapper;
    private final Map<String, LiveCommand> commands;
    private final Map<String, String> peerBySession = new ConcurrentHashMap<>();

    public LiveHandler(LiveRegistry registry, ObjectMapper mapper, List<LiveCommand> commands) {
        this.registry = registry;
        this.mapper = mapper;
        this.commands = commands.stream().collect(Collectors.toMap(LiveCommand::type, Function.identity()));
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession raw) throws Exception {
        WebSocketSession session = new ConcurrentWebSocketSessionDecorator(raw, 2000, 64 * 1024);
        String id = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        Peer peer = new Peer(id, COLORS[Math.floorMod(id.hashCode(), COLORS.length)], id, session);
        if (!registry.add(peer)) {
            session.close(CloseStatus.SERVICE_OVERLOAD);
            return;
        }
        peerBySession.put(raw.getId(), id);
        registry.send(peer, registry.node().put("t", "hello").put("id", id).put("color", peer.color())
                .put("seed", peer.seed()).put("name", peer.name()).put("online", registry.online())
                .set("peers", registry.describeAllExcept(id)));
        registry.broadcast(registry.node().put("t", "join").put("online", registry.online())
                .set("peer", registry.describe(peer)), id);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        Peer peer = registry.get(peerBySession.getOrDefault(session.getId(), ""));
        if (peer == null) return;
        try {
            JsonNode msg = mapper.readTree(message.getPayload());
            LiveCommand cmd = commands.get(msg.path("t").asText(""));
            if (cmd != null) cmd.handle(peer, msg);
        } catch (Exception ignored) {
            // malformed frames are ignored
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String id = peerBySession.remove(session.getId());
        if (id == null) return;
        registry.remove(id);
        registry.broadcast(registry.node().put("t", "leave").put("id", id).put("online", registry.online()), id);
    }
}
