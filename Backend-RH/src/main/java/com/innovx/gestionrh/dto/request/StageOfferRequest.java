package com.innovx.gestionrh.dto.request;

import com.innovx.gestionrh.Entity.InternshipType;
import com.innovx.gestionrh.Entity.StageOffer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StageOfferRequest {

    @NotBlank(message = "Offer title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 2000)
    private String description;

    private Long departmentId;

    @Size(max = 1000)
    private String requiredSkills;

    private InternshipType internshipType;

    private Integer durationMonths;

    private LocalDate startDate;

    private LocalDate deadline;

    private StageOffer.OfferStatus status;

    private Long version;
}
