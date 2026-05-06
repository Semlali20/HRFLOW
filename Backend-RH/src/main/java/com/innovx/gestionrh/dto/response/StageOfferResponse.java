package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.InternshipType;
import com.innovx.gestionrh.Entity.StageOffer;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class StageOfferResponse {
    private Long id;
    private Long version;
    private String title;
    private String description;
    private RefSummary department;
    private String requiredSkills;
    private InternshipType internshipType;
    private Integer durationMonths;
    private LocalDate startDate;
    private LocalDate deadline;
    private StageOffer.OfferStatus status;
    private long applicationCount;
    private LocalDateTime createdAt;
}
