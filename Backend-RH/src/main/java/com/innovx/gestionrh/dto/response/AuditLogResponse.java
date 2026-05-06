package com.innovx.gestionrh.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String action;
    private String module;
    private String description;
    private String ipAddress;
    private LocalDateTime timestamp;
}
