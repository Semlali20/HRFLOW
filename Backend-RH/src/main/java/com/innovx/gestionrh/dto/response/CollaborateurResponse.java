package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.ContractType;
import com.innovx.gestionrh.Entity.EmployeeStatus;
import com.innovx.gestionrh.Entity.Gender;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CollaborateurResponse {

    private Long id;
    private Long version;
    private String employeeNumber;
    private String firstName;
    private String lastName;
    private Gender gender;
    private String cin;
    private String nationality;
    private String category;
    private LocalDate dateOfBirth;
    private int age;
    private String email;
    private String phone;
    private String address;
    private String branch;
    private RefSummary department;
    private RefSummary position;
    private ContractType contractType;
    private LocalDate hireDate;
    private int seniorityYears;
    private int seniorityMonths;
    private EmployeeStatus status;
    private Long linkedUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
