package com.innovx.gestionrh.dto.request;

import com.innovx.gestionrh.Entity.PlanningEvent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class PlanningEventRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Start date/time is required")
    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    @Size(max = 200)
    private String location;

    private PlanningEvent.EventType type;

    /** User IDs to add as attendees. */
    private Set<Long> attendeeIds;

    private Long version;
}
