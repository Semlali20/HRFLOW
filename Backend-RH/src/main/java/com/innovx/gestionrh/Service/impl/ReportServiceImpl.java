package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.LeaveRequest;
import com.innovx.gestionrh.Entity.Payslip;
import com.innovx.gestionrh.Entity.Stagiaires;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.LeaveRequestRepository;
import com.innovx.gestionrh.Repository.PayslipRepository;
import com.innovx.gestionrh.Repository.StagiairesRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.ReportService;
import com.innovx.gestionrh.exception.BusinessException;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final CollaborateursRepository collaborateursRepository;
    private final StagiairesRepository stagiairesRepository;
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayslipRepository payslipRepository;

    @Override
    public Map<String, Object> getKpiDashboard() {
        try {
            Map<String, Object> kpis = new LinkedHashMap<>();
            kpis.put("totalEmployees", collaborateursRepository.count());
            kpis.put("totalInterns",   stagiairesRepository.count());
            kpis.put("totalUsers",     userRepository.count());
            return kpis;
        } catch (Exception e) {
            log.error("Failed to build KPI dashboard: {}", e.getMessage(), e);
            throw new BusinessException("REPORT_ERROR",
                    "Failed to generate KPI dashboard: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] exportEmployeesExcel() throws IOException {
        try {
            List<Collaborateurs> list = collaborateursRepository.findAll();
            try (XSSFWorkbook workbook = new XSSFWorkbook();
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {

                Sheet sheet = workbook.createSheet("Employees");
                CellStyle headerStyle = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                headerStyle.setFont(font);

                String[] headers = {
                        "Employee No", "Last Name", "First Name", "Email",
                        "Department", "Position", "Contract Type", "Hire Date"
                };
                Row headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.length; i++) {
                    org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (Collaborateurs c : list) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(orEmpty(c.getEmployeeNumber()));
                    row.createCell(1).setCellValue(orEmpty(c.getLastName()));
                    row.createCell(2).setCellValue(orEmpty(c.getFirstName()));
                    row.createCell(3).setCellValue(orEmpty(c.getEmail()));
                    row.createCell(4).setCellValue(
                            c.getDepartment() != null ? c.getDepartment().getName() : "");
                    row.createCell(5).setCellValue(
                            c.getPosition() != null ? c.getPosition().getTitle() : "");
                    row.createCell(6).setCellValue(
                            c.getContractType() != null ? c.getContractType().name() : "");
                    row.createCell(7).setCellValue(
                            c.getHireDate() != null ? c.getHireDate().toString() : "");
                }
                for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
                workbook.write(out);
                return out.toByteArray();
            }
        } catch (IOException e) {
            log.error("Failed to export employees Excel: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error exporting employees Excel: {}", e.getMessage(), e);
            throw new IOException("Failed to generate Excel report", e);
        }
    }

    @Override
    public byte[] exportInternsExcel() throws IOException {
        try {
            List<Stagiaires> list = stagiairesRepository.findAll();
            try (XSSFWorkbook workbook = new XSSFWorkbook();
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {

                Sheet sheet = workbook.createSheet("Interns");
                CellStyle headerStyle = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                headerStyle.setFont(font);

                String[] headers = {
                        "ID", "Last Name", "First Name", "CIN", "School",
                        "Start Date", "End Date", "Status"
                };
                Row headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.length; i++) {
                    org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (Stagiaires s : list) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(s.getId() != null ? s.getId() : 0L);
                    row.createCell(1).setCellValue(orEmpty(s.getLastName()));
                    row.createCell(2).setCellValue(orEmpty(s.getFirstName()));
                    row.createCell(3).setCellValue(orEmpty(s.getCin()));
                    row.createCell(4).setCellValue(orEmpty(s.getSchool()));
                    row.createCell(5).setCellValue(
                            s.getStartDate() != null ? s.getStartDate().toString() : "");
                    row.createCell(6).setCellValue(
                            s.getEndDate() != null ? s.getEndDate().toString() : "");
                    row.createCell(7).setCellValue(
                            s.getStatus() != null ? s.getStatus().name() : "");
                }
                for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
                workbook.write(out);
                return out.toByteArray();
            }
        } catch (IOException e) {
            log.error("Failed to export interns Excel: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error exporting interns Excel: {}", e.getMessage(), e);
            throw new IOException("Failed to generate interns Excel report", e);
        }
    }

    @Override
    public byte[] exportEmployeesPdf() throws IOException {
        try {
            List<Collaborateurs> list = collaborateursRepository.findAll();
            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                PdfWriter writer = new PdfWriter(out);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf);

                document.add(new Paragraph("Rapport Employés - INNOVX")
                        .setFontSize(18).setBold());
                document.add(new Paragraph("\n"));

                float[] colWidths = {80f, 100f, 100f, 150f, 120f, 120f};
                Table table = new Table(colWidths);
                table.addHeaderCell(new Cell().add(new Paragraph("Employee No").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Last Name").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("First Name").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Email").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Department").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Position").setBold()));

                for (Collaborateurs c : list) {
                    table.addCell(orEmpty(c.getEmployeeNumber()));
                    table.addCell(orEmpty(c.getLastName()));
                    table.addCell(orEmpty(c.getFirstName()));
                    table.addCell(orEmpty(c.getEmail()));
                    table.addCell(c.getDepartment() != null ? c.getDepartment().getName() : "");
                    table.addCell(c.getPosition()   != null ? c.getPosition().getTitle()  : "");
                }

                document.add(table);
                document.close();
                return out.toByteArray();
            }
        } catch (IOException e) {
            log.error("Failed to export employees PDF: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error exporting employees PDF: {}", e.getMessage(), e);
            throw new IOException("Failed to generate PDF report", e);
        }
    }

    // ── Leave Report — Excel ──────────────────────────────────────────────────

    @Override
    public byte[] exportLeaveReportExcel(int year) throws IOException {
        try {
            List<LeaveRequest> list = leaveRequestRepository.findAllByYear(year);
            try (XSSFWorkbook workbook = new XSSFWorkbook();
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {

                Sheet sheet = workbook.createSheet("Leave Report " + year);

                CellStyle headerStyle = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                headerStyle.setFont(font);
                headerStyle.setFillForegroundColor(IndexedColors.TEAL.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                String[] headers = {
                        "ID", "Employee", "Email", "Leave Type",
                        "Start Date", "End Date", "Days", "Status",
                        "Approved By", "Decided At"
                };
                Row headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.length; i++) {
                    org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (LeaveRequest lr : list) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(lr.getId() != null ? lr.getId() : 0L);
                    String empName = lr.getRequester() != null
                            ? orEmpty(lr.getRequester().getFirstName()) + " " + orEmpty(lr.getRequester().getLastName())
                            : "";
                    row.createCell(1).setCellValue(empName.trim());
                    row.createCell(2).setCellValue(lr.getRequester() != null ? orEmpty(lr.getRequester().getEmail()) : "");
                    row.createCell(3).setCellValue(lr.getLeaveType() != null ? orEmpty(lr.getLeaveType().getName()) : "");
                    row.createCell(4).setCellValue(lr.getStartDate() != null ? lr.getStartDate().toString() : "");
                    row.createCell(5).setCellValue(lr.getEndDate()   != null ? lr.getEndDate().toString()   : "");
                    row.createCell(6).setCellValue(lr.getDurationDays());
                    row.createCell(7).setCellValue(lr.getStatus() != null ? lr.getStatus().name() : "");
                    String approverName = lr.getApprover() != null
                            ? orEmpty(lr.getApprover().getFirstName()) + " " + orEmpty(lr.getApprover().getLastName())
                            : "";
                    row.createCell(8).setCellValue(approverName.trim());
                    row.createCell(9).setCellValue(lr.getDecidedAt() != null ? lr.getDecidedAt().toString() : "");
                }
                for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
                workbook.write(out);
                return out.toByteArray();
            }
        } catch (IOException e) {
            log.error("Failed to export leave report Excel (year={}): {}", year, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error exporting leave report Excel (year={}): {}", year, e.getMessage(), e);
            throw new IOException("Failed to generate leave report Excel", e);
        }
    }

    // ── Leave Report — PDF ────────────────────────────────────────────────────

    @Override
    public byte[] exportLeaveReportPdf(int year) throws IOException {
        try {
            List<LeaveRequest> list = leaveRequestRepository.findAllByYear(year);
            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                PdfWriter writer = new PdfWriter(out);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf);

                document.add(new Paragraph("Leave Report " + year + " — INNOVX")
                        .setFontSize(18).setBold().setTextAlignment(TextAlignment.CENTER));
                document.add(new Paragraph("Total leave requests: " + list.size())
                        .setFontSize(11).setFontColor(ColorConstants.GRAY));
                document.add(new Paragraph("\n"));

                Table table = new Table(UnitValue.createPercentArray(new float[]{1f, 2f, 2f, 1.5f, 1.5f, 1f, 1.5f}))
                        .useAllAvailableWidth();
                String[] hdrs = {"Employee", "Leave Type", "Start", "End", "Days", "Status", "Approved By"};
                for (String h : hdrs) {
                    table.addHeaderCell(new Cell().add(new Paragraph(h).setBold().setFontSize(9)));
                }
                for (LeaveRequest lr : list) {
                    String empName = lr.getRequester() != null
                            ? orEmpty(lr.getRequester().getFirstName()) + " " + orEmpty(lr.getRequester().getLastName())
                            : "";
                    String approver = lr.getApprover() != null
                            ? orEmpty(lr.getApprover().getFirstName()) + " " + orEmpty(lr.getApprover().getLastName())
                            : "—";
                    table.addCell(new Cell().add(new Paragraph(empName.trim()).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(lr.getLeaveType() != null ? lr.getLeaveType().getName() : "").setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(lr.getStartDate() != null ? lr.getStartDate().toString() : "").setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(lr.getEndDate() != null ? lr.getEndDate().toString() : "").setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(String.valueOf(lr.getDurationDays())).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(lr.getStatus() != null ? lr.getStatus().name() : "").setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(approver.trim()).setFontSize(8)));
                }
                document.add(table);
                document.close();
                return out.toByteArray();
            }
        } catch (IOException e) {
            log.error("Failed to export leave report PDF (year={}): {}", year, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error exporting leave report PDF (year={}): {}", year, e.getMessage(), e);
            throw new IOException("Failed to generate leave report PDF", e);
        }
    }

    // ── Payroll Summary — Excel ───────────────────────────────────────────────

    @Override
    public byte[] exportPayrollSummaryExcel(int year) throws IOException {
        try {
            List<Payslip> list = payslipRepository.findAllByYear(year);
            try (XSSFWorkbook workbook = new XSSFWorkbook();
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {

                Sheet sheet = workbook.createSheet("Payroll " + year);

                CellStyle headerStyle = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                headerStyle.setFont(font);
                headerStyle.setFillForegroundColor(IndexedColors.TEAL.getIndex());
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                // Currency cell style
                CellStyle currencyStyle = workbook.createCellStyle();
                DataFormat dataFormat = workbook.createDataFormat();
                currencyStyle.setDataFormat(dataFormat.getFormat("#,##0.00"));

                String[] headers = {
                        "Payslip ID", "Employee No", "Last Name", "First Name",
                        "Period", "Base Salary", "Bonuses", "Deductions",
                        "Net Salary", "Status", "Payment Date"
                };
                Row headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.length; i++) {
                    org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (Payslip p : list) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(p.getId() != null ? p.getId() : 0L);
                    String empNo = p.getCollaborateur() != null ? orEmpty(p.getCollaborateur().getEmployeeNumber()) : "";
                    String lastName  = p.getCollaborateur() != null ? orEmpty(p.getCollaborateur().getLastName())  : "";
                    String firstName = p.getCollaborateur() != null ? orEmpty(p.getCollaborateur().getFirstName()) : "";
                    row.createCell(1).setCellValue(empNo);
                    row.createCell(2).setCellValue(lastName);
                    row.createCell(3).setCellValue(firstName);
                    row.createCell(4).setCellValue(orEmpty(p.getPeriod()));

                    org.apache.poi.ss.usermodel.Cell baseCell = row.createCell(5);
                    baseCell.setCellValue(p.getBaseSalary() != null ? p.getBaseSalary().doubleValue() : 0.0);
                    baseCell.setCellStyle(currencyStyle);

                    org.apache.poi.ss.usermodel.Cell bonusCell = row.createCell(6);
                    bonusCell.setCellValue(p.getBonuses() != null ? p.getBonuses().doubleValue() : 0.0);
                    bonusCell.setCellStyle(currencyStyle);

                    org.apache.poi.ss.usermodel.Cell dedCell = row.createCell(7);
                    dedCell.setCellValue(p.getDeductions() != null ? p.getDeductions().doubleValue() : 0.0);
                    dedCell.setCellStyle(currencyStyle);

                    org.apache.poi.ss.usermodel.Cell netCell = row.createCell(8);
                    netCell.setCellValue(p.getNetSalary() != null ? p.getNetSalary().doubleValue() : 0.0);
                    netCell.setCellStyle(currencyStyle);

                    row.createCell(9).setCellValue(p.getStatus() != null ? p.getStatus().name() : "");
                    row.createCell(10).setCellValue(p.getPaymentDate() != null ? p.getPaymentDate().toString() : "");
                }
                for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
                workbook.write(out);
                return out.toByteArray();
            }
        } catch (IOException e) {
            log.error("Failed to export payroll summary Excel (year={}): {}", year, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error exporting payroll summary Excel (year={}): {}", year, e.getMessage(), e);
            throw new IOException("Failed to generate payroll summary Excel", e);
        }
    }

    // ── Payroll Summary — PDF ─────────────────────────────────────────────────

    @Override
    public byte[] exportPayrollSummaryPdf(int year) throws IOException {
        try {
            List<Payslip> list = payslipRepository.findAllByYear(year);
            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                PdfWriter writer = new PdfWriter(out);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf);

                double totalNet = list.stream()
                        .mapToDouble(p -> p.getNetSalary() != null ? p.getNetSalary().doubleValue() : 0.0)
                        .sum();

                document.add(new Paragraph("Payroll Summary " + year + " — INNOVX")
                        .setFontSize(18).setBold().setTextAlignment(TextAlignment.CENTER));
                document.add(new Paragraph(String.format("Total payslips: %d  |  Total net paid: %.2f", list.size(), totalNet))
                        .setFontSize(11).setFontColor(ColorConstants.GRAY));
                document.add(new Paragraph("\n"));

                Table table = new Table(UnitValue.createPercentArray(new float[]{1.5f, 2f, 1.2f, 1.2f, 1.2f, 1.5f, 1.5f}))
                        .useAllAvailableWidth();
                String[] hdrs = {"Employee No", "Name", "Period", "Base", "Bonuses", "Net Salary", "Status"};
                for (String h : hdrs) {
                    table.addHeaderCell(new Cell().add(new Paragraph(h).setBold().setFontSize(9)));
                }
                for (Payslip p : list) {
                    String empNo   = p.getCollaborateur() != null ? orEmpty(p.getCollaborateur().getEmployeeNumber()) : "";
                    String name    = p.getCollaborateur() != null
                            ? orEmpty(p.getCollaborateur().getFirstName()) + " " + orEmpty(p.getCollaborateur().getLastName())
                            : "";
                    table.addCell(new Cell().add(new Paragraph(empNo).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(name.trim()).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(orEmpty(p.getPeriod())).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(p.getBaseSalary() != null ? String.format("%.2f", p.getBaseSalary()) : "0.00").setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(p.getBonuses() != null ? String.format("%.2f", p.getBonuses()) : "0.00").setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(p.getNetSalary() != null ? String.format("%.2f", p.getNetSalary()) : "0.00").setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(p.getStatus() != null ? p.getStatus().name() : "").setFontSize(8)));
                }
                document.add(table);
                document.close();
                return out.toByteArray();
            }
        } catch (IOException e) {
            log.error("Failed to export payroll summary PDF (year={}): {}", year, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error exporting payroll summary PDF (year={}): {}", year, e.getMessage(), e);
            throw new IOException("Failed to generate payroll summary PDF", e);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String orEmpty(String value) {
        return value != null ? value : "";
    }
}
