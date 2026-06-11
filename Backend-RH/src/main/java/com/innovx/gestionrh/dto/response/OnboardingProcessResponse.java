package com.innovx.gestionrh.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OnboardingProcessResponse {
    private Long id;
    private Long collaborateurId;
    private String collaborateurName;
    private String type;
    private LocalDate startDate;
    private LocalDate targetEndDate;
    private String status;
    private int completedCount;
    private int totalCount;
    private int progressPercent;
    private List<OnboardingTaskResponse> tasks;
}
