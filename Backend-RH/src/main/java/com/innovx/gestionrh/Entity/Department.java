package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departments",
       uniqueConstraints = @UniqueConstraint(name = "uk_departments_code", columnNames = "code"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@ToString(exclude = "manager")
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code", nullable = false, length = 20)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    /** Optional: the user who manages this department. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
