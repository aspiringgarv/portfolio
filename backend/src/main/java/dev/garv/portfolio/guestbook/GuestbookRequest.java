package dev.garv.portfolio.guestbook;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GuestbookRequest(
        @Size(max = 40, message = "Name is too long.") String name,
        @NotBlank(message = "Say something first.") @Size(max = 200, message = "Keep it under 200 characters.") String text,
        @Size(max = 40, message = "Avatar seed is too long.") String avatarSeed) {}
