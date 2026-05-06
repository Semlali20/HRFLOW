package com.innovx.gestionrh.dto.response;

import lombok.Data;

@Data
public class LeaveTypeResponse {
    private Long id;
    private Long version;
    private String name;
    private String description;
    private Integer maxDaysPerYear;
    private int defaultDaysPerYear;
    private boolean carryOver;
    private boolean requiresDocument;
    private boolean active;
}
