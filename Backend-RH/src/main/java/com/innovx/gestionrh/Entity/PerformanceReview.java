package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "performance_reviews", indexes = {
    @Index(name = "idx_pr_collaborateur", columnList = "collaborateur_id"),
    @Index(name = "idx_pr_period", columnList = "reviewPeriod"),
    @Index(name = "idx_pr_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@ToString(exclude = {"collaborateur"})
public class PerformanceReview extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collaborateur_id", nullable = false)
    private Collaborateurs collaborateur;

    @Column(nullable = false, length = 20)
    private String reviewPeriod; // e.g. "2024-Q1"

    @Column(nullable = false)
    private LocalDate reviewDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.DRAFT;

    // Scores 1–5
    private Integer technicalScore;
    private Integer communicationScore;
    private Integer teamworkScore;
    private Integer initiativeScore;
    private Integer attendanceScore;

    @Transient
    public Double getOverallScore() {
        int count = 0;
        double sum = 0;
        if (technicalScore != null)     { sum += technicalScore;     count++; }
        if (communicationScore != null) { sum += communicationScore; count++; }
        if (teamworkScore != null)      { sum += teamworkScore;      count++; }
        if (initiativeScore != null)    { sum += initiativeScore;    count++; }
        if (attendanceScore != null)    { sum += attendanceScore;    count++; }
        return count > 0 ? Math.round(sum / count * 10.0) / 10.0 : null;
    }

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String improvements;

    @Column(columnDefinition = "TEXT")
    private String goals;

    @Column(columnDefinition = "TEXT")
    private String reviewerNotes;

    private String reviewerName;

    public enum ReviewStatus { DRAFT, SUBMITTED, ACKNOWLEDGED }
}
