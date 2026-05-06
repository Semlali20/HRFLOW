package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.LeaveStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveRequestResponse {
    private Long id;
    private Long version;
    private RefSummary requester;
    private RefSummary leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private int durationDays;
    private String reason;
    private LeaveStatus status;
    private RefSummary approver;
    private String approverComment;
    private LocalDateTime decidedAt;
    private LocalDateTime createdAt;
}
