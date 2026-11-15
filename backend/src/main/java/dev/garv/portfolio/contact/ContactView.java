package dev.garv.portfolio.contact;

import java.time.Instant;

public record ContactView(Long id, String name, String email, String message, Instant createdAt) {
    static ContactView of(ContactMessage m) {
        return new ContactView(m.getId(), m.getName(), m.getEmail(), m.getMessage(), m.getCreatedAt());
    }
}
