package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.DocumentCategory;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DocumentResponse {
    private Long id;
    private Long version;
    private RefSummary employee;
    private String originalFilename;
    private String mimeType;
    private Long fileSize;
    private DocumentCategory category;
    private String description;
    private LocalDate expiryDate;
    private boolean expired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
