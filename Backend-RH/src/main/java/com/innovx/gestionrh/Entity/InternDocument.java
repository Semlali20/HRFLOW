package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Tracks document submission for an intern.
 * Replaces the 10 boolean flag columns that were on Stagiaires.
 * Each row represents one required document and whether it has been submitted.
 */
@Entity
@Table(name = "intern_documents",
       uniqueConstraints = @UniqueConstraint(
               name = "uk_intern_doc_type",
               columnNames = {"intern_id", "document_type"}))
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class InternDocument extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "intern_id", nullable = false)
    private Stagiaires intern;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 40)
    private InternDocumentType documentType;

    @Column(name = "submitted", nullable = false)
    @Builder.Default
    private boolean submitted = false;

    @Column(name = "submitted_date")
    private LocalDate submittedDate;

    @Column(name = "notes", length = 500)
    private String notes;
}
