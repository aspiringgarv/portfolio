package dev.garv.portfolio;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:test;DB_CLOSE_DELAY=-1",
        "portfolio.admin-token=secret"})
class ApiTest {
    @Autowired MockMvc mvc;

    @Test void clientRoutesForwardToIndex() throws Exception {
        mvc.perform(get("/algorithms")).andExpect(forwardedUrl("/index.html"));
        mvc.perform(get("/cube")).andExpect(forwardedUrl("/index.html"));
    }

    @Test void profileIsServed() throws Exception {
        mvc.perform(get("/api/profile")).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Garv Arora"));
    }

    @Test void contactRejectsBadEmail() throws Exception {
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"A\",\"email\":\"nope\",\"message\":\"hi\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Enter a valid email."));
    }

    @Test void contactStoresAndAdminReadsIt() throws Exception {
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Ada\",\"email\":\"ada@x.io\",\"message\":\"hello there\"}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/admin/messages")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/messages").header("X-Admin-Token", "secret"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].name").value("Ada"));
    }

    @Test void honeypotIsDropped() throws Exception {
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Bot\",\"email\":\"b@x.io\",\"message\":\"spam\",\"website\":\"http://x\"}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/admin/messages").header("X-Admin-Token", "secret"))
                .andExpect(jsonPath("$[?(@.name=='Bot')]").isEmpty());
    }

    @Test void guestbookRoundTrip() throws Exception {
        mvc.perform(post("/api/guestbook").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Lin\",\"text\":\"great site\",\"avatarSeed\":\"abc\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Lin"));
        mvc.perform(post("/api/guestbook").contentType(MediaType.APPLICATION_JSON).content("{\"text\":\"\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/guestbook")).andExpect(jsonPath("$[0].text").value("great site"));
    }

    @Test void visitCounterIncrements() throws Exception {
        mvc.perform(post("/api/visit")).andExpect(status().isOk()).andExpect(jsonPath("$.visits").value(1));
        mvc.perform(get("/api/stats")).andExpect(jsonPath("$.visits").value(1));
    }
}
