package com.innovx.gestionrh.dto.request;

import com.innovx.gestionrh.Entity.InternStatus;
import com.innovx.gestionrh.Entity.InternshipType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InternRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;

    @Size(max = 20)
    private String cin;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private Long departmentId;

    @Size(max = 300)
    private String internshipSubject;

    @Size(max = 150)
    private String supervisorName;

    @Size(max = 200)
    private String school;

    private InternshipType internshipType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private InternStatus status;

    /** For optimistic locking on updates. */
    private Long version;
}
