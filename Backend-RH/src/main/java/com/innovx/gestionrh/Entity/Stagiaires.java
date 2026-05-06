package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

/**
 * Represents an intern (stagiaire).
 *
 * Design changes from original:
 *  - All dates use LocalDate (not java.util.Date).
 *  - Duration is computed in the service layer — never stored.
 *  - Boolean document flags replaced by InternDocument child entity.
 *  - Scheduled meeting dates replaced by Meeting child entity.
 *  - Business logic (createMeetings, adjustForWeekend) moved to InternService.
 *  - @Version enables optimistic locking.
 */
@Entity
@Table(name = "stagiaires",
       uniqueConstraints = @UniqueConstraint(name = "uk_stagiaires_cin", columnNames = "cin"))
@SQLRestriction("is_deleted = false")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@ToString(exclude = "department")
public class Stagiaires extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "cin", length = 20)
    private String cin;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "internship_subject", length = 300)
    private String internshipSubject;

    @Column(name = "supervisor_name", length = 150)
    private String supervisorName;

    @Column(name = "school", length = 200)
    private String school;

    @Enumerated(EnumType.STRING)
    @Column(name = "internship_type", length = 20)
    private InternshipType internshipType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private InternStatus status = InternStatus.PENDING;

    /** Relative path or URL to the intern's photo. */
    @Column(name = "photo_path", length = 500)
    private String photoPath;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean isDeleted = false;
}
