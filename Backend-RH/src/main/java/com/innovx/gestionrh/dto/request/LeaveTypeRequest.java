package com.innovx.gestionrh.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LeaveTypeRequest {

    @NotBlank(message = "Leave type name is required")
    @Size(max = 80)
    private String name;

    @Size(max = 300)
    private String description;

    @Min(value = 1, message = "Max days per year must be at least 1")
    private Integer maxDaysPerYear;

    @Min(value = 0)
    private int defaultDaysPerYear = 30;

    private boolean carryOver = false;
    private boolean requiresDocument = false;
    private boolean active = true;
    private Long version;
}
