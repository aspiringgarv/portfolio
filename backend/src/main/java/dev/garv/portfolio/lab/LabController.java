package dev.garv.portfolio.lab;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/lab")
public class LabController {
    private final PipelineSimulator pipeline;
    private final PaymentLab payment;
    private final PathfindService pathfind;

    public LabController(PipelineSimulator pipeline, PaymentLab payment, PathfindService pathfind) {
        this.pipeline = pipeline;
        this.payment = payment;
        this.pathfind = pathfind;
    }

    public record TransitionRequest(String status, String event) {}

    @PostMapping("/pipeline")
    public PipelineResult pipeline(@Valid @RequestBody PipelineRequest req) {
        return pipeline.run(req);
    }

    @GetMapping("/payment/transitions")
    public List<PaymentLab.Transition> transitions() {
        return payment.table();
    }

    @PostMapping("/payment/transition")
    public PaymentLab.Transition transition(@RequestBody TransitionRequest req) {
        try {
            return payment.apply(PaymentLab.Status.valueOf(req.status()), PaymentLab.Event.valueOf(req.event()));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown status or event.");
        }
    }

    @PostMapping("/pathfind")
    public PathfindResult pathfind(@Valid @RequestBody PathfindRequest req) {
        return pathfind.solve(req);
    }
}
