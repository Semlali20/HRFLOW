package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

/**
 * Represents an employee (collaborateur) within the organisation.
 *
 * Design notes:
 *  - Linked to a User account via an optional OneToOne relationship:
 *    not every employee necessarily has a system login.
 *  - Seniority / age are NEVER stored — always computed at query time.
 *  - Department and Position are proper entities, not free-text strings.
 *  - @Version enables optimistic locking to prevent lost-update anomalies.
 */
@Entity
@Table(name = "collaborateurs",
       uniqueConstraints = {
               @UniqueConstraint(name = "uk_collab_email",  columnNames = "email"),
               @UniqueConstraint(name = "uk_collab_cin",    columnNames = "cin"),
               @UniqueConstraint(name = "uk_collab_emp_no", columnNames = "employee_number")
       },
       indexes = {
               @Index(name = "idx_collab_department", columnList = "department_id"),
               @Index(name = "idx_collab_status",     columnList = "status")
       })
@SQLRestriction("is_deleted = false")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@ToString(exclude = {"user", "department", "position"})
public class Collaborateurs extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    /** Human-readable identifier, e.g. EMP-0042. */
    @Column(name = "employee_number", nullable = false, length = 20)
    private String employeeNumber;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    @Column(name = "cin", length = 20)
    private String cin;

    @Column(name = "nationality", length = 60)
    private String nationality;

    @Column(name = "category", length = 60)
    private String category;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "address", length = 300)
    private String address;

    @Column(name = "branch", length = 100)
    private String branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", length = 20)
    private ContractType contractType;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "contract_start_date")
    private LocalDate contractStartDate;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    @Column(name = "notice_period_days")
    private Integer noticePeriodDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    /** Optional link to a system User account — null for employees without login access. */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean isDeleted = false;
}
