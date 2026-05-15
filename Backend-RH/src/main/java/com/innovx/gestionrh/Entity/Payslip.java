package com.innovx.gestionrh.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payslips", uniqueConstraints = {
        @UniqueConstraint(name = "uk_payslip_collab_period", columnNames = {"collaborateur_id", "period"})
})
@SQLRestriction("is_deleted = false")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@ToString(exclude = {"collaborateur"})
public class Payslip extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collaborateur_id", nullable = false)
    private Collaborateurs collaborateur;

    @Column(nullable = false, length = 7)
    private String period;

    @Column(name = "base_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseSalary;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal bonuses = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PayslipStatus status = PayslipStatus.DRAFT;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean isDeleted = false;
}
