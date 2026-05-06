package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.InternDocumentType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InternDocumentResponse {
    private Long id;
    private Long version;
    private InternDocumentType documentType;
    private boolean submitted;
    private LocalDate submittedDate;
    private String notes;
}
