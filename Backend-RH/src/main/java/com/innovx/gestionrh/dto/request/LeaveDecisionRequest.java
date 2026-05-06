package com.innovx.gestionrh.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LeaveDecisionRequest {

    @Size(max = 500, message = "Comment must not exceed 500 characters")
    private String comment;
}
