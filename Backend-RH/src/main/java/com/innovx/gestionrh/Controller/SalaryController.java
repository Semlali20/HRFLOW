package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.PayslipStatus;
import com.innovx.gestionrh.Service.PayslipService;
import com.innovx.gestionrh.dto.request.PayslipRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import com.innovx.gestionrh.dto.response.PayslipResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/salaries")
@RequiredArgsConstructor
public class SalaryController {

    private final PayslipService payslipService;

    @PostMapping
    @PreAuthorize("hasAuthority('SALARY_CREATE')")
    public ResponseEntity<ApiResponse<PayslipResponse>> create(@Valid @RequestBody PayslipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payslip created", payslipService.create(request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SALARY_READ')")
    public ResponseEntity<PagedResponse<PayslipResponse>> findAll(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) PayslipStatus status,
            @PageableDefault(size = 200, sort = "period", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(payslipService.findAll(period, status, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SALARY_READ')")
    public ResponseEntity<ApiResponse<PayslipResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(payslipService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SALARY_UPDATE')")
    public ResponseEntity<ApiResponse<PayslipResponse>> update(
            @PathVariable Long id, @Valid @RequestBody PayslipRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Payslip updated", payslipService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('SALARY_UPDATE')")
    public ResponseEntity<ApiResponse<PayslipResponse>> updateStatus(
            @PathVariable Long id, @RequestParam PayslipStatus status) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", payslipService.updateStatus(id, status)));
    }

    @GetMapping("/collaborateur/{collaborateurId}")
    @PreAuthorize("hasAuthority('SALARY_READ')")
    public ResponseEntity<PagedResponse<PayslipResponse>> findByCollaborateur(
            @PathVariable Long collaborateurId,
            @PageableDefault(size = 50, sort = "period", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(payslipService.findByCollaborateur(collaborateurId, pageable)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SALARY_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        payslipService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Payslip deleted"));
    }
}
