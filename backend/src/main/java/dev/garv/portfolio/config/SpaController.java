package dev.garv.portfolio.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Client-side routes: let the browser reload or deep-link /algorithms and /cube. */
@Controller
public class SpaController {
    @GetMapping({"/algorithms", "/cube", "/watch"})
    public String spa() {
        return "forward:/index.html";
    }
}
