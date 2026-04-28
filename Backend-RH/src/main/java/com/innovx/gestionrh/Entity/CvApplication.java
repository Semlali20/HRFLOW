package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cv_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id")
    private StageOffer offer;

    private String candidateName;
    private String candidateEmail;
    private String cvFileName;
    private String cvFilePath;

    @Column(length = 2000)
    private String extractedText;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private KanbanStage stage = KanbanStage.NEW;

    @Column(length = 500)
    private String notes;

    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public enum KanbanStage {
        NEW, REVIEWING, SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, REJECTED
    }
}
