package com.innovx.gestionrh.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PayslipRequest {

    @NotNull(message = "Employee ID is required")
    private Long collaborateurId;

    @NotBlank(message = "Period is required")
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "Period must be in YYYY-MM format")
    private String period;

    @NotNull(message = "Base salary is required")
    @DecimalMin(value = "0.0", message = "Base salary must be positive")
    private BigDecimal baseSalary;

    @DecimalMin(value = "0.0", message = "Bonuses must be positive")
    private BigDecimal bonuses;

    @DecimalMin(value = "0.0", message = "Deductions must be positive")
    private BigDecimal deductions;

    private LocalDate paymentDate;

    private Long version;
}
