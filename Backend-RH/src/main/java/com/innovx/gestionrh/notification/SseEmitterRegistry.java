package com.innovx.gestionrh.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registry of active SSE emitters, keyed by a user identifier string.
 *
 * The key is the userId as a String (e.g. "42"). Using a string key lets the
 * registry work regardless of whether the caller passes an email or a numeric ID,
 * but the convention throughout this application is to key by userId.toString().
 */
@Component
@Slf4j
public class SseEmitterRegistry {

    /** userId.toString() → active emitter */
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    /**
     * Registers a new SSE connection for the given user key.
     * Any existing (stale) connection for the same key is gracefully closed first.
     */
    public SseEmitter register(String userKey) {
        // Remove stale emitter if one exists
        SseEmitter existing = emitters.remove(userKey);
        if (existing != null) {
            try { existing.complete(); } catch (Exception ignored) {}
        }

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitter.onCompletion(() -> {
            emitters.remove(userKey);
            log.debug("SSE connection completed for user key: {}", userKey);
        });
        emitter.onTimeout(() -> {
            emitters.remove(userKey);
            emitter.complete();
            log.debug("SSE connection timed out for user key: {}", userKey);
        });
        emitter.onError(e -> {
            emitters.remove(userKey);
            log.warn("SSE connection error for user key {}: {}", userKey, e.getMessage());
        });

        emitters.put(userKey, emitter);
        log.debug("SSE emitter registered for user key: {} (total connected: {})", userKey, emitters.size());

        // Send initial connected event so the client knows the stream is live
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("SSE connection established"));
        } catch (IOException e) {
            log.warn("Could not send connected event to user key {}: {}", userKey, e.getMessage());
            emitters.remove(userKey);
        }

        return emitter;
    }

    /**
     * Convenience overload that accepts a numeric userId directly.
     */
    public SseEmitter register(Long userId) {
        return register(userId.toString());
    }

    /**
     * Sends a notification payload to the user identified by {@code userKey}.
     * If the user has no active SSE connection, the call is a no-op (they will
     * receive the notification via polling instead).
     */
    public void sendToUser(String userKey, Object data) {
        SseEmitter emitter = emitters.get(userKey);
        if (emitter == null) return;
        try {
            emitter.send(SseEmitter.event().name("notification").data(data));
            log.debug("SSE notification sent to user key: {}", userKey);
        } catch (Exception e) {
            log.warn("Failed to send SSE to user key '{}', removing stale emitter: {}", userKey, e.getMessage());
            emitters.remove(userKey);
        }
    }

    /**
     * Convenience overload that accepts a numeric userId directly.
     */
    public void sendToUser(Long userId, Object data) {
        sendToUser(userId.toString(), data);
    }

    /**
     * Broadcasts a payload to all currently connected clients.
     */
    public void broadcast(Object data) {
        emitters.keySet().forEach(key -> sendToUser(key, data));
    }

    public int getConnectedCount() {
        return emitters.size();
    }

    /** Heartbeat every 25 seconds — keeps connections alive through proxies and firewalls. */
    @Scheduled(fixedDelay = 25_000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        log.debug("Sending SSE heartbeat to {} connected client(s)", emitters.size());
        emitters.forEach((key, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name("heartbeat").data("ping"));
            } catch (Exception e) {
                log.warn("Heartbeat failed for user key '{}', removing stale emitter", key);
                emitters.remove(key);
            }
        });
    }
}
