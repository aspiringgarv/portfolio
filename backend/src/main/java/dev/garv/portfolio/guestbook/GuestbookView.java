package dev.garv.portfolio.guestbook;

import java.time.Instant;

public record GuestbookView(Long id, String name, String text, String avatarSeed, Instant createdAt) {
    static GuestbookView of(GuestbookEntry e) {
        return new GuestbookView(e.getId(), e.getName(), e.getText(), e.getAvatarSeed(), e.getCreatedAt());
    }
}
