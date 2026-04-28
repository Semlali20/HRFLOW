package com.innovx.gestionrh.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class SseEmitterRegistry {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter register(String email) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(email, emitter);

        emitter.onCompletion(() -> emitters.remove(email));
        emitter.onTimeout(() -> {
            emitters.remove(email);
            emitter.complete();
        });
        emitter.onError(e -> emitters.remove(email));

        log.debug("SSE emitter registered for: {}", email);
        return emitter;
    }

    public void send(String email, Object data) {
        SseEmitter emitter = emitters.get(email);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(data));
            } catch (Exception e) {
                log.warn("Failed to send SSE to {}: {}", email, e.getMessage());
                emitters.remove(email);
            }
        }
    }

    public void broadcast(Object data) {
        emitters.forEach((email, emitter) -> send(email, data));
    }

    public int getConnectedCount() {
        return emitters.size();
    }
}
