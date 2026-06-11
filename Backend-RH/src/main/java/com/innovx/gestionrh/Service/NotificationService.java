package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.NotificationType;
import com.innovx.gestionrh.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    /** Persists and SSE-pushes a notification to a user. */
    void send(Long recipientId, String title, String message, NotificationType type, String actionUrl);

    Page<NotificationResponse> getForUser(Long userId, Pageable pageable);

    long countUnread(Long userId);

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    void delete(Long notificationId, Long userId);

    void clearRead(Long userId);
}
