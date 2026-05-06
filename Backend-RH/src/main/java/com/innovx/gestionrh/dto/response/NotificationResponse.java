package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean read;
    private String actionUrl;
    private LocalDateTime createdAt;
}
