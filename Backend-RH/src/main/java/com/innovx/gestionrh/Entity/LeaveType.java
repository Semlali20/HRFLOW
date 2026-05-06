package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_types",
       uniqueConstraints = @UniqueConstraint(name = "uk_leave_types_name", columnNames = "name"))
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class LeaveType extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    @Column(name = "description", length = 300)
    private String description;

    /** Maximum days allowed per calendar year. Null means unlimited. */
    @Column(name = "max_days_per_year")
    private Integer maxDaysPerYear;

    /** Default balance granted at the start of each year. */
    @Column(name = "default_days_per_year")
    @Builder.Default
    private int defaultDaysPerYear = 30;

    /** If true, unused days carry over to the next year. */
    @Column(name = "carry_over", nullable = false)
    @Builder.Default
    private boolean carryOver = false;

    /** If true, this leave type requires supporting documentation. */
    @Column(name = "requires_document", nullable = false)
    @Builder.Default
    private boolean requiresDocument = false;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
