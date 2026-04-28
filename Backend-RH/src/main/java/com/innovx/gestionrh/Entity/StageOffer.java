package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stage_offers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StageOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String department;
    private String requiredSkills;
    private int durationMonths;
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OfferStatus status = OfferStatus.OPEN;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum OfferStatus { OPEN, CLOSED, FILLED }
}
