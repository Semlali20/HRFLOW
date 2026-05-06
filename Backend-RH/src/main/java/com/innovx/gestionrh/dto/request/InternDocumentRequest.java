package com.innovx.gestionrh.dto.request;

import com.innovx.gestionrh.Entity.InternDocumentType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InternDocumentRequest {

    @NotNull(message = "Document type is required")
    private InternDocumentType documentType;

    private boolean submitted;

    private LocalDate submittedDate;

    private String notes;

    private Long version;
}
