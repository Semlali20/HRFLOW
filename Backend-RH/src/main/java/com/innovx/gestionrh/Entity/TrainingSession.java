package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "training_sessions", indexes = {
    @Index(name = "idx_ts_status",     columnList = "status"),
    @Index(name = "idx_ts_start_date", columnList = "start_date"),
    @Index(name = "idx_ts_category",   columnList = "category")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@ToString(exclude = {"participants"})
public class TrainingSession extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** TECHNICAL, SOFT_SKILLS, COMPLIANCE, MANAGEMENT, OTHER */
    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /** ONSITE, ONLINE, HYBRID */
    @Column(nullable = false, length = 50)
    private String location;

    @Column(name = "trainer_name", length = 150)
    private String trainerName;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    private Double cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TrainingStatus status = TrainingStatus.PLANNED;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "training_participants",
        joinColumns = @JoinColumn(name = "training_id"),
        inverseJoinColumns = @JoinColumn(name = "collaborateur_id")
    )
    @Builder.Default
    private Set<Collaborateurs> participants = new HashSet<>();

    public enum TrainingStatus {
        PLANNED, ONGOING, COMPLETED, CANCELLED
    }
}
