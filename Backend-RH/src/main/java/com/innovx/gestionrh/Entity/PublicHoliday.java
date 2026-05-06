package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Public holidays excluded from working-day leave calculations.
 */
@Entity
@Table(name = "public_holidays",
       uniqueConstraints = @UniqueConstraint(name = "uk_public_holiday_date_country",
               columnNames = {"holiday_date", "country_code"}))
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class PublicHoliday extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "holiday_date", nullable = false)
    private LocalDate holidayDate;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /** ISO-3166 alpha-2, e.g. "MA" for Morocco. Defaults to company's locale. */
    @Column(name = "country_code", nullable = false, length = 5)
    @Builder.Default
    private String countryCode = "MA";

    @Column(name = "recurring", nullable = false)
    @Builder.Default
    private boolean recurring = true;
}
