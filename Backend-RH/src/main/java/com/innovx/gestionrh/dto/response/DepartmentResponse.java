package com.innovx.gestionrh.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DepartmentResponse {
    private Long id;
    private Long version;
    private String name;
    private String code;
    private String description;
    private RefSummary manager;
    private boolean active;
    private long employeeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
