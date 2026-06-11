package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "onboarding_task_templates")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@ToString(exclude = "template")
public class OnboardingTaskTemplate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private OnboardingTemplate template;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String assignedTo; // HR, MANAGER, IT, EMPLOYEE

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(nullable = false)
    private Integer dueDaysOffset; // days after hire date
}
