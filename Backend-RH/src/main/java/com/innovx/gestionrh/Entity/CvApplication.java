package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cv_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@ToString(exclude = "offer")
public class CvApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id")
    private StageOffer offer;

    @Column(name = "candidate_name", nullable = false, length = 150)
    private String candidateName;

    @Column(name = "candidate_email", length = 150)
    private String candidateEmail;

    @Column(name = "candidate_phone", length = 30)
    private String candidatePhone;

    @Column(name = "cv_file_name", length = 255)
    private String cvFileName;

    @Column(name = "cv_file_path", length = 500)
    private String cvFilePath;

    /** Raw text extracted from the CV for full-text search via PostgreSQL. */
    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 30)
    @Builder.Default
    private KanbanStage stage = KanbanStage.NEW;

    @Column(name = "score")
    private Integer score;

    @Column(name = "notes", length = 1000)
    private String notes;

    public enum KanbanStage {
        NEW, REVIEWING, SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, REJECTED
    }
}
