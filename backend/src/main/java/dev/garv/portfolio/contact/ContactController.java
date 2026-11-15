package dev.garv.portfolio.contact;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ContactController {
    private final ContactService service;
    private final AdminGuard admin;

    public ContactController(ContactService service, AdminGuard admin) {
        this.service = service;
        this.admin = admin;
    }

    @PostMapping("/contact")
    public Map<String, Boolean> submit(@Valid @RequestBody ContactRequest req) {
        service.submit(req);
        return Map.of("ok", true);
    }

    @GetMapping("/admin/messages")
    public List<ContactView> messages(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        admin.require(token);
        return service.all();
    }
}
