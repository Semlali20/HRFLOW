package com.innovx.gestionrh.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class OnboardingProcessRequest {
    @NotNull private Long collaborateurId;
    @NotNull private String type; // ONBOARDING or OFFBOARDING
    @NotNull private LocalDate startDate;
    private LocalDate targetEndDate;
    private Long templateId; // optional — if provided, tasks are copied from template
}
