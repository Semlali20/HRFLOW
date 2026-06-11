package com.innovx.gestionrh.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PerformanceReviewRequest {

    @NotNull
    private Long collaborateurId;

    @NotBlank
    private String reviewPeriod;

    @NotNull
    private LocalDate reviewDate;

    @Min(1) @Max(5)
    private Integer technicalScore;

    @Min(1) @Max(5)
    private Integer communicationScore;

    @Min(1) @Max(5)
    private Integer teamworkScore;

    @Min(1) @Max(5)
    private Integer initiativeScore;

    @Min(1) @Max(5)
    private Integer attendanceScore;

    private String strengths;
    private String improvements;
    private String goals;
    private String reviewerNotes;
    private String reviewerName;
}
