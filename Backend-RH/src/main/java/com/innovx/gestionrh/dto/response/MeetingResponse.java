package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.MeetingStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MeetingResponse {
    private Long id;
    private Long version;
    private String title;
    private String description;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String location;
    private String onlineLink;
    private MeetingStatus status;
    private String meetingType;
    private RefSummary organizer;
    private List<RefSummary> participants;
    private RefSummary intern;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
