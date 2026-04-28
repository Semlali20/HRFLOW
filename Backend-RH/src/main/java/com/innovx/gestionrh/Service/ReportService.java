package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.Stagiaires;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.StagiairesRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import lombok.RequiredArgsConstructor;
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
public class ReportService {

    private final CollaborateursRepository collaborateursRepository;
    private final StagiairesRepository stagiairesRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getKpiDashboard() {
        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("totalEmployees", collaborateursRepository.count());
        kpis.put("totalInterns", stagiairesRepository.count());
        kpis.put("totalUsers", userRepository.count());
        return kpis;
    }

    public byte[] exportEmployeesExcel() throws IOException {
        List<Collaborateurs> list = collaborateursRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Employees");
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            String[] headers = {"Matricule", "Nom", "Prenom", "Email", "Département", "Fonction", "Type", "Date Entrée"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Collaborateurs c : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(c.getMatricule() != null ? c.getMatricule() : 0);
                row.createCell(1).setCellValue(c.getNom() != null ? c.getNom() : "");
                row.createCell(2).setCellValue(c.getPrenom() != null ? c.getPrenom() : "");
                row.createCell(3).setCellValue(c.getEmail() != null ? c.getEmail() : "");
                row.createCell(4).setCellValue(c.getDépartement() != null ? c.getDépartement() : "");
                row.createCell(5).setCellValue(c.getFonction() != null ? c.getFonction() : "");
                row.createCell(6).setCellValue(c.getType() != null ? c.getType() : "");
                row.createCell(7).setCellValue(c.getDate_entree() != null ? c.getDate_entree() : "");
            }
            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportInternsExcel() throws IOException {
        List<Stagiaires> list = stagiairesRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Interns");
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            String[] headers = {"Matricule", "Nom", "Prenom", "Email", "École", "Durée (mois)"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Stagiaires s : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(s.getMatricule() != null ? s.getMatricule() : 0);
                row.createCell(1).setCellValue(s.getNom() != null ? s.getNom() : "");
                row.createCell(2).setCellValue(s.getPrenom() != null ? s.getPrenom() : "");
            }
            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportEmployeesPdf() throws IOException {
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
            table.addHeaderCell(new Cell().add(new Paragraph("Matricule").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Nom").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Prénom").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Email").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Département").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Fonction").setBold()));

            for (Collaborateurs c : list) {
                table.addCell(String.valueOf(c.getMatricule()));
                table.addCell(c.getNom() != null ? c.getNom() : "");
                table.addCell(c.getPrenom() != null ? c.getPrenom() : "");
                table.addCell(c.getEmail() != null ? c.getEmail() : "");
                table.addCell(c.getDépartement() != null ? c.getDépartement() : "");
                table.addCell(c.getFonction() != null ? c.getFonction() : "");
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        }
    }
}
