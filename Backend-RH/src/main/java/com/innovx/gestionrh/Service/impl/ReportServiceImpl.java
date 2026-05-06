package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.Stagiaires;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.StagiairesRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.ReportService;
import com.innovx.gestionrh.exception.BusinessException;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
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

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String orEmpty(String value) {
        return value != null ? value : "";
    }
}
