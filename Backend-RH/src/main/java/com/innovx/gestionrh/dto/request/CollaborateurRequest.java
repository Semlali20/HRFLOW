package com.innovx.gestionrh.dto.request;

import com.innovx.gestionrh.Entity.ContractType;
import com.innovx.gestionrh.Entity.EmployeeStatus;
import com.innovx.gestionrh.Entity.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CollaborateurRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    private Gender gender;

    @Size(max = 20, message = "CIN must not exceed 20 characters")
    private String cin;

    @Size(max = 60, message = "Nationality must not exceed 60 characters")
    private String nationality;

    @Size(max = 60, message = "Category must not exceed 60 characters")
    private String category;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 150)
    private String email;

    @Size(max = 30, message = "Phone must not exceed 30 characters")
    private String phone;

    @Size(max = 300, message = "Address must not exceed 300 characters")
    private String address;

    @Size(max = 100, message = "Branch must not exceed 100 characters")
    private String branch;

    private Long departmentId;

    private Long positionId;

    private ContractType contractType;

    @PastOrPresent(message = "Hire date must be today or in the past")
    private LocalDate hireDate;

    private LocalDate contractStartDate;

    private LocalDate contractEndDate;

    private Integer noticePeriodDays;

    private EmployeeStatus status;

    /** Optional: ID of the User account to link to this employee. */
    private Long userId;

    /** For optimistic locking on updates — required on PUT requests. */
    private Long version;
}
