package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.CvApplication;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CvApplicationResponse {
    private Long id;
    private Long version;
    private RefSummary offer;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String cvFileName;
    private CvApplication.KanbanStage stage;
    private Integer score;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
