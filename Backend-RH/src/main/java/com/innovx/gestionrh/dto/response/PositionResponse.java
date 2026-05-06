package com.innovx.gestionrh.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PositionResponse {
    private Long id;
    private Long version;
    private String title;
    private String code;
    private String description;
    private RefSummary department;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
