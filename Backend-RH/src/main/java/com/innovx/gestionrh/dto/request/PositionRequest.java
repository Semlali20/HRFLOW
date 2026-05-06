package com.innovx.gestionrh.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PositionRequest {

    @NotBlank(message = "Position title is required")
    @Size(max = 150)
    private String title;

    @Size(max = 30)
    private String code;

    @Size(max = 500)
    private String description;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private boolean active = true;

    private Long version;
}
