package com.innovx.gestionrh.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OnboardingTaskResponse {
    private Long id;
    private String title;
    private String description;
    private String assignedTo;
    private Integer orderIndex;
    private LocalDate dueDate;
    private boolean completed;
    private LocalDateTime completedAt;
    private String notes;
    private boolean overdue;
}
