package dev.garv.portfolio.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** {@code website} is a honeypot: real users never see or fill it. */
public record ContactRequest(
        @NotBlank(message = "Name is required.") @Size(max = 80, message = "Name is too long.") String name,
        @NotBlank(message = "Email is required.") @Email(message = "Enter a valid email.")
        @Size(max = 120, message = "Email is too long.") String email,
        @NotBlank(message = "Message is required.") @Size(max = 2000, message = "Message is too long.") String message,
        String website) {}
