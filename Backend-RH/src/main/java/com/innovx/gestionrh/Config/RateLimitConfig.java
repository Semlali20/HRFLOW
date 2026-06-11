package com.innovx.gestionrh.Config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory IP-based rate limiter.
 * Limits the number of requests per key (IP or IP+email) within a fixed time window.
 *
 * NOT cluster-safe — for multi-instance deployments replace this with a
 * Redis-backed solution (e.g. Bucket4j + Spring Data Redis).
 */
@Component
public class RateLimitConfig {

    private static final Logger log = LoggerFactory.getLogger(RateLimitConfig.class);

    // Max attempts allowed within one window
    private static final int MAX_ATTEMPTS = 10;
    // Window duration in seconds
    private static final long WINDOW_SECONDS = 60;

    private final ConcurrentHashMap<String, AttemptWindow> attempts = new ConcurrentHashMap<>();

    public boolean isAllowed(String key) {
        AttemptWindow window = attempts.compute(key, (k, existing) -> {
            Instant now = Instant.now();
            if (existing == null || now.isAfter(existing.windowEnd)) {
                return new AttemptWindow(now.plusSeconds(WINDOW_SECONDS), new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });
        boolean allowed = window.count.get() <= MAX_ATTEMPTS;
        if (!allowed) {
            log.warn("Rate limit exceeded for key: {}", key);
        }
        return allowed;
    }

    public void reset(String key) {
        attempts.remove(key);
    }

    private static class AttemptWindow {
        final Instant windowEnd;
        final AtomicInteger count;

        AttemptWindow(Instant windowEnd, AtomicInteger count) {
            this.windowEnd = windowEnd;
            this.count = count;
        }
    }
}
