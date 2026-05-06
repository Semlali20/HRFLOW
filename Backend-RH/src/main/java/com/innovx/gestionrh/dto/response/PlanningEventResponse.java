package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.PlanningEvent;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PlanningEventResponse {
    private Long id;
    private Long version;
    private String title;
    private String description;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String location;
    private PlanningEvent.EventType type;
    private RefSummary createdBy;
    private List<RefSummary> attendees;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
