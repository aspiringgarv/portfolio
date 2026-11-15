package dev.garv.portfolio.guestbook;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guestbook")
public class GuestbookController {
    private final GuestbookService service;

    public GuestbookController(GuestbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<GuestbookView> list() {
        return service.latest();
    }

    @PostMapping
    public GuestbookView sign(@Valid @RequestBody GuestbookRequest req) {
        return service.sign(req);
    }
}
