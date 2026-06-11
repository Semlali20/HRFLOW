package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Year;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/kpi")
    @PreAuthorize("hasAuthority('REPORT_READ')")
    public ResponseEntity<Map<String, Object>> getKpis() {
        return ResponseEntity.ok(reportService.getKpiDashboard());
    }

    @GetMapping("/employees/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportEmployeesExcel() throws IOException {
        byte[] data = reportService.exportEmployeesExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employees.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/interns/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportInternsExcel() throws IOException {
        byte[] data = reportService.exportInternsExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=interns.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/employees/pdf")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportEmployeesPdf() throws IOException {
        byte[] data = reportService.exportEmployeesPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employees.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    // ── Leave Report ──────────────────────────────────────────────────────────

    @GetMapping("/leaves/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportLeavesExcel(
            @RequestParam(defaultValue = "0") int year) throws IOException {
        int targetYear = year > 0 ? year : Year.now().getValue();
        byte[] data = reportService.exportLeaveReportExcel(targetYear);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"leave_report_" + targetYear + ".xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/leaves/pdf")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportLeavesPdf(
            @RequestParam(defaultValue = "0") int year) throws IOException {
        int targetYear = year > 0 ? year : Year.now().getValue();
        byte[] data = reportService.exportLeaveReportPdf(targetYear);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"leave_report_" + targetYear + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    // ── Payroll Summary ───────────────────────────────────────────────────────

    @GetMapping("/payroll/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportPayrollExcel(
            @RequestParam(defaultValue = "0") int year) throws IOException {
        int targetYear = year > 0 ? year : Year.now().getValue();
        byte[] data = reportService.exportPayrollSummaryExcel(targetYear);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"payroll_summary_" + targetYear + ".xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/payroll/pdf")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportPayrollPdf(
            @RequestParam(defaultValue = "0") int year) throws IOException {
        int targetYear = year > 0 ? year : Year.now().getValue();
        byte[] data = reportService.exportPayrollSummaryPdf(targetYear);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"payroll_summary_" + targetYear + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
