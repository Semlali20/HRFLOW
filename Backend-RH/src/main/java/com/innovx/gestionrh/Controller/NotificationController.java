package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Config.SseTicketStore;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.NotificationService;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.NotificationResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import com.innovx.gestionrh.notification.SseEmitterRegistry;
import com.innovx.gestionrh.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SseEmitterRegistry sseEmitterRegistry;
    private final SseTicketStore sseTicketStore;
    private final UserRepository userRepository;

    /**
     * SSE stream — client subscribes here after obtaining a short-lived ticket via
     * POST /api/v1/auth/sse-ticket. The ticket is consumed immediately (one-time use)
     * so the JWT is never exposed as a URL query parameter in server access logs.
     *
     * Authentication flow:
     *   1. Client POSTs /api/v1/auth/sse-ticket (with Bearer JWT in header) → { ticket }
     *   2. Client opens EventSource("/api/v1/notifications/stream?ticket=<ticket>")
     *   3. This endpoint validates & consumes the ticket, registers the SSE emitter.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam("ticket") String ticket) {
        String email = sseTicketStore.consume(ticket);
        if (email == null) {
            log.warn("SSE stream rejected — invalid or expired ticket");
            SseEmitter rejected = new SseEmitter(0L);
            rejected.completeWithError(new SecurityException("Invalid or expired SSE ticket"));
            return rejected;
        }
        return userRepository.findByEmail(email)
                .map(user -> sseEmitterRegistry.register(user.getId()))
                .orElseGet(() -> {
                    log.warn("SSE stream rejected — no user found for email from ticket");
                    SseEmitter rejected = new SseEmitter(0L);
                    rejected.completeWithError(new SecurityException("User not found"));
                    return rejected;
                });
    }

    @GetMapping
    public ResponseEntity<PagedResponse<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(notificationService.getForUser(currentUser.getId(), pageable)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> countUnread(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.countUnread(currentUser.getId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read."));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        notificationService.delete(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notification deleted successfully."));
    }

    @DeleteMapping("/clear-read")
    public ResponseEntity<ApiResponse<Void>> clearRead(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        notificationService.clearRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Read notifications cleared."));
    }
}
