package dev.garv.portfolio.contact;

import dev.garv.portfolio.common.TextSanitizer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContactService {
    private final ContactRepository repo;

    public ContactService(ContactRepository repo) {
        this.repo = repo;
    }

    /** Honeypot hits are silently accepted (and dropped) so bots get no signal. */
    @Transactional
    public void submit(ContactRequest req) {
        if (req.website() != null && !req.website().isBlank()) return;
        repo.save(new ContactMessage(
                TextSanitizer.clean(req.name(), 80),
                TextSanitizer.clean(req.email(), 120),
                TextSanitizer.clean(req.message(), 2000)));
    }

    @Transactional(readOnly = true)
    public List<ContactView> all() {
        return repo.findAllByOrderByCreatedAtDesc().stream().map(ContactView::of).toList();
    }
}
