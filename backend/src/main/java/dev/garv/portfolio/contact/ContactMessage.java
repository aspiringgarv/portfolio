package dev.garv.portfolio.contact;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
public class ContactMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 80)
    private String name;
    @Column(nullable = false, length = 120)
    private String email;
    @Column(nullable = false, length = 2000)
    private String message;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected ContactMessage() {}

    public ContactMessage(String name, String email, String message) {
        this.name = name;
        this.email = email;
        this.message = message;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
}
