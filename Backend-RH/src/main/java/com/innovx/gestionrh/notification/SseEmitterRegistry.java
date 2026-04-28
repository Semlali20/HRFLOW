package com.innovx.gestionrh.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class SseEmitterRegistry {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter register(String email) {
        // Remove stale emitter for this user if one exists
        SseEmitter existing = emitters.remove(email);
        if (existing != null) {
            try { existing.complete(); } catch (Exception ignored) {}
        }

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitter.onCompletion(() -> {
            emitters.remove(email);
            log.debug("SSE connection completed for: {}", email);
        });
        emitter.onTimeout(() -> {
            emitters.remove(email);
            emitter.complete();
            log.debug("SSE connection timed out for: {}", email);
        });
        emitter.onError(e -> {
            emitters.remove(email);
            log.warn("SSE connection error for {}: {}", email, e.getMessage());
        });

        emitters.put(email, emitter);
        log.debug("SSE emitter registered for: {} (total connected: {})", email, emitters.size());

        // Send initial connection-established event so client knows the stream is live
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("SSE connection established"));
        } catch (IOException e) {
            log.warn("Could not send connected event to {}: {}", email, e.getMessage());
            emitters.remove(email);
        }

        return emitter;
    }

    public void send(String email, Object data) {
        SseEmitter emitter = emitters.get(email);
        if (emitter == null) return;
        try {
            emitter.send(SseEmitter.event().name("notification").data(data));
            log.debug("SSE notification sent to: {}", email);
        } catch (Exception e) {
            log.warn("Failed to send SSE to '{}', removing stale emitter: {}", email, e.getMessage());
            emitters.remove(email);
        }
    }

    public void broadcast(Object data) {
        emitters.forEach((email, emitter) -> send(email, data));
    }

    public int getConnectedCount() {
        return emitters.size();
    }

    /** Heartbeat every 25 seconds to keep connections alive through proxies and firewalls */
    @Scheduled(fixedDelay = 25_000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        log.debug("Sending SSE heartbeat to {} connected client(s)", emitters.size());
        emitters.forEach((email, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name("heartbeat").data("ping"));
            } catch (Exception e) {
                log.warn("Heartbeat failed for '{}', removing stale emitter", email);
                emitters.remove(email);
            }
        });
    }
}
