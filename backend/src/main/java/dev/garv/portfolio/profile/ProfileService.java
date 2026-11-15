package dev.garv.portfolio.profile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

/** Loads the portfolio content (resume data) once at startup from data/profile.json. */
@Service
public class ProfileService {
    private final JsonNode profile;

    public ProfileService(ObjectMapper mapper) throws IOException {
        try (InputStream in = new ClassPathResource("data/profile.json").getInputStream()) {
            this.profile = mapper.readTree(in);
        }
    }

    public JsonNode profile() {
        return profile;
    }
}
