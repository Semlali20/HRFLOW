package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.Notification;
import com.innovx.gestionrh.Service.NotificationService;
import com.innovx.gestionrh.notification.SseEmitterRegistry;
import com.innovx.gestionrh.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SseEmitterRegistry sseEmitterRegistry;

    /** SSE stream — Angular subscribes here on login */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return sseEmitterRegistry.register(userDetails.getEmail());
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnread(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(notificationService.getUnread(userDetails.getEmail()));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        notificationService.markAllRead(userDetails.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/send")
    public void triggerDailyNotifications() {
        notificationService.sendDailyNotifications();
    }
}
