package com.innovx.gestionrh.dto.request;

import com.innovx.gestionrh.Entity.DocumentCategory;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DocumentUploadRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Document category is required")
    private DocumentCategory category;

    @Size(max = 300)
    private String description;

    private LocalDate expiryDate;
}
