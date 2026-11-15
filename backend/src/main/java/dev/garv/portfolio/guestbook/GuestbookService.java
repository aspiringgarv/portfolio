package dev.garv.portfolio.guestbook;

import dev.garv.portfolio.common.TextSanitizer;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class GuestbookService {
    private static final int PAGE = 50;
    private final GuestbookRepository repo;

    public GuestbookService(GuestbookRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<GuestbookView> latest() {
        return repo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, PAGE)).stream().map(GuestbookView::of).toList();
    }

    @Transactional
    public GuestbookView sign(GuestbookRequest req) {
        String name = TextSanitizer.clean(req.name(), 40);
        String seed = TextSanitizer.clean(req.avatarSeed(), 40);
        var saved = repo.save(new GuestbookEntry(
                name.isEmpty() ? "anonymous" : name,
                TextSanitizer.clean(req.text(), 200),
                seed.isEmpty() ? UUID.randomUUID().toString().substring(0, 8) : seed));
        return GuestbookView.of(saved);
    }
}
