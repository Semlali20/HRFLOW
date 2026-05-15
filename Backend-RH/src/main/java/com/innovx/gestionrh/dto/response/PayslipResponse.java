package com.innovx.gestionrh.dto.response;

import com.innovx.gestionrh.Entity.PayslipStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PayslipResponse {
    private Long id;
    private Long version;
    private Long collaborateurId;
    private String collaborateurNom;
    private String collaborateurPrenom;
    private String period;
    private BigDecimal baseSalary;
    private BigDecimal bonuses;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    private PayslipStatus status;
    private LocalDate paymentDate;
    private String fileName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
