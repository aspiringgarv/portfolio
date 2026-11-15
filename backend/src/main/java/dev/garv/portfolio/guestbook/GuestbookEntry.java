package dev.garv.portfolio.guestbook;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
public class GuestbookEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 40)
    private String name;
    @Column(nullable = false, length = 200)
    private String text;
    @Column(nullable = false, length = 40)
    private String avatarSeed;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected GuestbookEntry() {}

    public GuestbookEntry(String name, String text, String avatarSeed) {
        this.name = name;
        this.text = text;
        this.avatarSeed = avatarSeed;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getText() { return text; }
    public String getAvatarSeed() { return avatarSeed; }
    public Instant getCreatedAt() { return createdAt; }
}
