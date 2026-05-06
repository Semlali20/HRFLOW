package com.innovx.gestionrh.dto.request;

import com.innovx.gestionrh.Entity.MeetingStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class MeetingRequest {

    @NotBlank(message = "Meeting title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Scheduled date/time is required")
    private LocalDateTime scheduledAt;

    @Min(value = 5, message = "Duration must be at least 5 minutes")
    private Integer durationMinutes;

    @Size(max = 200)
    private String location;

    @Size(max = 500)
    private String onlineLink;

    private MeetingStatus status;

    @Size(max = 50)
    private String meetingType;

    private Long organizerId;

    /** User IDs to add as participants. */
    private Set<Long> participantIds;

    /** Optional intern this meeting relates to. */
    private Long internId;

    @Size(max = 2000)
    private String notes;

    private Long version;
}
