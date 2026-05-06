package com.innovx.gestionrh.dto.response;

import lombok.Data;

@Data
public class LeaveBalanceResponse {
    private Long id;
    private RefSummary leaveType;
    private int year;
    private int totalDays;
    private int usedDays;
    private int pendingDays;
    private int remainingDays;
}
