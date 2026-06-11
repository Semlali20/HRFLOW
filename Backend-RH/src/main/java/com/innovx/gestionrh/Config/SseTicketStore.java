package com.innovx.gestionrh.Config;

import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Short-lived, one-time-use ticket store for SSE authentication.
 *
 * Avoids sending a long-lived JWT as a URL query parameter (which gets logged
 * in server access logs and browser history). The client first calls
 * POST /api/v1/auth/sse-ticket to obtain a 32-char ticket valid for 30 seconds,
 * then opens the SSE stream with ?ticket=<ticket>. The ticket is consumed
 * immediately on first use.
 */
@Component
public class SseTicketStore {

    private record Entry(String email, Instant expiresAt) {}
    private final Map<String, Entry> store = new ConcurrentHashMap<>();

    /**
     * Issues a new single-use ticket for the given user email.
     * The ticket is a 32-character hex string derived from a UUID.
     *
     * @param email the authenticated user's email
     * @return the ticket string
     */
    public String issue(String email) {
        String ticket = UUID.randomUUID().toString().replace("-", "");
        store.put(ticket, new Entry(email, Instant.now().plusSeconds(30)));
        return ticket;
    }

    /**
     * Validates and consumes a ticket (one-time use).
     *
     * @param ticket the ticket to consume
     * @return the email associated with the ticket, or {@code null} if the ticket
     *         is unknown, already consumed, or expired
     */
    public String consume(String ticket) {
        Entry e = store.remove(ticket);
        if (e == null || Instant.now().isAfter(e.expiresAt())) return null;
        return e.email();
    }

    /**
     * Removes all expired entries. Call this periodically or on each consume
     * to prevent unbounded memory growth from abandoned tickets.
     */
    public void evictExpired() {
        Instant now = Instant.now();
        store.entrySet().removeIf(en -> now.isAfter(en.getValue().expiresAt()));
    }
}
