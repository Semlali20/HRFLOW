package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.PerformanceReview.ReviewStatus;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PerformanceReviewResponse {

    private Long id;
    private Long collaborateurId;
    private String collaborateurName;
    private String reviewPeriod;
    private LocalDate reviewDate;
    private ReviewStatus status;
    private Integer technicalScore;
    private Integer communicationScore;
    private Integer teamworkScore;
    private Integer initiativeScore;
    private Integer attendanceScore;
    private Double overallScore;
    private String strengths;
    private String improvements;
    private String goals;
    private String reviewerNotes;
    private String reviewerName;
}
