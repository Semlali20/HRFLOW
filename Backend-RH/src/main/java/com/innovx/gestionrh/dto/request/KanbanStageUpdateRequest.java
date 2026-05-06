package com.innovx.gestionrh.dto.request;

import com.innovx.gestionrh.Entity.CvApplication;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class KanbanStageUpdateRequest {

    @NotNull(message = "Stage is required")
    private CvApplication.KanbanStage stage;

    private String notes;

    private Integer score;

    private Long version;
}
