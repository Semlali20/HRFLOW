package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.TrainingSession.TrainingStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
public class TrainingSessionResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String trainerName;
    private Integer maxParticipants;
    private Double cost;
    private TrainingStatus status;

    private Set<Long> participantIds;
    private List<String> participantNames;
    private int participantCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
