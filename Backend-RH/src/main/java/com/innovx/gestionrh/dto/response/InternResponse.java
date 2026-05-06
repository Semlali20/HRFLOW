package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.InternStatus;
import com.innovx.gestionrh.Entity.InternshipType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class InternResponse {
    private Long id;
    private Long version;
    private String firstName;
    private String lastName;
    private String cin;
    private LocalDate dateOfBirth;
    private RefSummary department;
    private String internshipSubject;
    private String supervisorName;
    private String school;
    private InternshipType internshipType;
    private LocalDate startDate;
    private LocalDate endDate;
    private int durationMonths;
    private InternStatus status;
    private String photoPath;
    private int totalDocuments;
    private int submittedDocuments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
