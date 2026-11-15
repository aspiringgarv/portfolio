package dev.garv.portfolio.live;

import com.fasterxml.jackson.databind.JsonNode;

/** Command pattern: one implementation per inbound message type ("t" field). */
public interface LiveCommand {
    String type();

    void handle(Peer from, JsonNode msg);
}
