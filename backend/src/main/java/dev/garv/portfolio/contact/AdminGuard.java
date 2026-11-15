package dev.garv.portfolio.contact;

import dev.garv.portfolio.config.AppProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/** Constant-time check of the X-Admin-Token header; disabled entirely when no token is configured. */
@Component
public class AdminGuard {
    private final String token;

    public AdminGuard(AppProperties props) {
        this.token = props.adminToken() == null ? "" : props.adminToken();
    }

    public void require(String presented) {
        boolean ok = !token.isBlank() && presented != null && MessageDigest.isEqual(
                token.getBytes(StandardCharsets.UTF_8), presented.getBytes(StandardCharsets.UTF_8));
        if (!ok) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized.");
    }
}
