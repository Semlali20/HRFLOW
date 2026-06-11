package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "onboarding_processes", indexes = {
    @Index(name = "idx_op_collaborateur", columnList = "collaborateur_id"),
    @Index(name = "idx_op_status", columnList = "status")
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@ToString(exclude = {"collaborateur", "tasks"})
public class OnboardingProcess extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collaborateur_id", nullable = false)
    private Collaborateurs collaborateur;

    @Column(nullable = false, length = 20)
    private String type; // ONBOARDING, OFFBOARDING

    @Column(nullable = false)
    private LocalDate startDate;

    @Column
    private LocalDate targetEndDate;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProcessStatus status = ProcessStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "process", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OnboardingTask> tasks = new ArrayList<>();

    public enum ProcessStatus { IN_PROGRESS, COMPLETED, CANCELLED }

    public int getCompletedCount() { return (int) tasks.stream().filter(OnboardingTask::isCompleted).count(); }
    public int getProgressPercent() { return tasks.isEmpty() ? 0 : (int)(getCompletedCount() * 100.0 / tasks.size()); }
}
