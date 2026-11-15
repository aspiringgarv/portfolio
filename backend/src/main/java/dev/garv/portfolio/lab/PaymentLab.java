package dev.garv.portfolio.lab;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Port of the payment lifecycle from my GoPay project: every status change is a lookup in a
 * (status, event) -> status table, so an illegal change cannot happen by accident.
 */
@Service
public class PaymentLab {
    public enum Status { CREATED, AUTHORIZING, AUTHORIZED, CAPTURING, CAPTURED, FAILED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED, SETTLED, AUTH_EXPIRED }

    public enum Event { AUTHORIZE_ATTEMPT, AUTHORIZE_SUCCESS, AUTHORIZE_FAIL, CAPTURE_REQUEST, CAPTURE_SUCCESS, CAPTURE_FAIL, REFUND_INIT, REFUND_COMPLETE, SETTLE, CANCEL, CAPTURE_TIMEOUT }

    public record Transition(Status from, Event event, Status to) {}

    private record Key(Status from, Event event) {}

    private static final Map<Key, Status> TABLE = new LinkedHashMap<>();

    private static void t(Status from, Event e, Status to) { TABLE.put(new Key(from, e), to); }

    static {
        t(Status.CREATED, Event.AUTHORIZE_ATTEMPT, Status.AUTHORIZING);
        t(Status.CREATED, Event.AUTHORIZE_SUCCESS, Status.AUTHORIZED);
        t(Status.CREATED, Event.AUTHORIZE_FAIL, Status.FAILED);
        t(Status.CREATED, Event.CANCEL, Status.CANCELLED);
        t(Status.AUTHORIZING, Event.AUTHORIZE_SUCCESS, Status.AUTHORIZED);
        t(Status.AUTHORIZING, Event.AUTHORIZE_FAIL, Status.FAILED);
        t(Status.AUTHORIZED, Event.CAPTURE_REQUEST, Status.CAPTURING);
        t(Status.AUTHORIZED, Event.CAPTURE_TIMEOUT, Status.AUTH_EXPIRED);
        t(Status.AUTHORIZED, Event.CANCEL, Status.CANCELLED);
        t(Status.CAPTURING, Event.CAPTURE_SUCCESS, Status.CAPTURED);
        t(Status.CAPTURING, Event.CAPTURE_FAIL, Status.FAILED);
        t(Status.CAPTURED, Event.SETTLE, Status.SETTLED);
        t(Status.CAPTURED, Event.REFUND_INIT, Status.PARTIALLY_REFUNDED);
        t(Status.CAPTURED, Event.REFUND_COMPLETE, Status.REFUNDED);
        t(Status.SETTLED, Event.REFUND_INIT, Status.PARTIALLY_REFUNDED);
        t(Status.SETTLED, Event.REFUND_COMPLETE, Status.REFUNDED);
        t(Status.PARTIALLY_REFUNDED, Event.REFUND_COMPLETE, Status.REFUNDED);
    }

    public List<Transition> table() {
        List<Transition> out = new ArrayList<>();
        TABLE.forEach((k, to) -> out.add(new Transition(k.from(), k.event(), to)));
        return out;
    }

    public Transition apply(Status from, Event event) {
        Status to = TABLE.get(new Key(from, event));
        if (to == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "INVALID_PAYMENT_STATE_TRANSITION: no transition for event " + event + " from status " + from);
        }
        return new Transition(from, event, to);
    }
}
