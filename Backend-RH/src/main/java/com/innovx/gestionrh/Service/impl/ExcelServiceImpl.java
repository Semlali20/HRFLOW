package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.ContractType;
import com.innovx.gestionrh.Entity.Gender;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Service.ExcelService;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.FileStorageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Handles bulk employee import from Excel (XLSX / XLS) files.
 *
 * <p>Expected column order (0-based):
 * <ol start="0">
 *   <li>Last name (Nom)</li>
 *   <li>First name (Prénom)</li>
 *   <li>Sex (M / F / MALE / FEMALE / HOMME / FEMME)</li>
 *   <li>CIN</li>
 *   <li>Nationality</li>
 *   <li>Category</li>
 *   <li>Date of birth (dd/MM/yyyy or yyyy-MM-dd)</li>
 *   <li>Email</li>
 *   <li>Branch (Filiale)</li>
 *   <li>Contract type (CDI / CDD / …)</li>
 *   <li>Hire date (dd/MM/yyyy or yyyy-MM-dd)</li>
 * </ol>
 *
 * <p>Fields that existed in the legacy import but have no matching field
 * in the redesigned entity (matricule, age, ancienneté, département as string,
 * fonction as string) are intentionally omitted. Department and Position must
 * be assigned via the dedicated management endpoints after import.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelServiceImpl implements ExcelService {

    private final CollaborateursRepository collaborateursRepository;

    @Override
    public void importDataFromExcel(InputStream inputStream) {
        if (inputStream == null) {
            throw new BusinessException("NULL_INPUT_STREAM",
                    "The Excel input stream must not be null.");
        }

        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new BusinessException("EMPTY_WORKBOOK",
                        "The uploaded Excel file contains no sheets.");
            }

            Iterator<Row> rowIterator = sheet.iterator();
            if (!rowIterator.hasNext()) {
                throw new BusinessException("EMPTY_SHEET",
                        "The first sheet of the uploaded Excel file is empty.");
            }
            rowIterator.next(); // skip header row

            if (!rowIterator.hasNext()) {
                throw new BusinessException("NO_DATA_ROWS",
                        "The Excel file contains a header row but no data rows.");
            }

            List<Collaborateurs> collaborateursList = new ArrayList<>();
            int rowNumber = 1;

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                rowNumber++;
                try {
                    Collaborateurs c = mapRow(row);
                    if (c != null) {
                        collaborateursList.add(c);
                    }
                } catch (Exception e) {
                    log.warn("Skipping row {} due to mapping error: {}", rowNumber, e.getMessage());
                }
            }

            if (collaborateursList.isEmpty()) {
                throw new BusinessException("NO_VALID_ROWS",
                        "No valid employee rows could be read from the Excel file. "
                        + "Check the column format and try again.");
            }

            collaborateursRepository.saveAll(collaborateursList);
            log.info("Excel import completed: {} employee record(s) saved.", collaborateursList.size());

        } catch (BusinessException e) {
            throw e;
        } catch (IOException e) {
            log.error("Failed to parse Excel file: {}", e.getMessage(), e);
            throw new FileStorageException(
                    "The uploaded file could not be read as a valid Excel workbook: "
                    + e.getMessage(), e);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Collaborateurs mapRow(Row row) {
        String lastName  = getStringCellValue(row.getCell(0));
        String firstName = getStringCellValue(row.getCell(1));
        String email     = getStringCellValue(row.getCell(7));

        // Skip entirely blank rows (no name and no email)
        if (isBlank(lastName) && isBlank(firstName) && isBlank(email)) {
            return null;
        }

        Collaborateurs c = new Collaborateurs();
        c.setLastName(lastName);
        c.setFirstName(firstName);
        c.setGender(parseGender(getStringCellValue(row.getCell(2))));
        c.setCin(getStringCellValue(row.getCell(3)));
        c.setNationality(getStringCellValue(row.getCell(4)));
        c.setCategory(getStringCellValue(row.getCell(5)));
        c.setDateOfBirth(parseDate(getStringCellValue(row.getCell(6))));
        c.setEmail(email);
        c.setBranch(getStringCellValue(row.getCell(8)));
        c.setContractType(parseContractType(getStringCellValue(row.getCell(9))));
        c.setHireDate(parseDate(getStringCellValue(row.getCell(10))));

        // employeeNumber is required (NOT NULL in DB); generate a temporary placeholder
        // so the import succeeds — HR can correct via the update endpoint.
        c.setEmployeeNumber("IMP-" + System.nanoTime());

        return c;
    }

    @SuppressWarnings("deprecation")
    private String getStringCellValue(Cell cell) {
        if (cell == null) return null;
        cell.setCellType(CellType.STRING);
        String value = cell.getStringCellValue();
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private double getNumericCellValue(Cell cell) {
        if (cell == null) return 0;
        // getCellType() already returns CellType in modern POI — no forInt() needed
        CellType cellType = cell.getCellType();
        if (cellType == CellType.NUMERIC) return cell.getNumericCellValue();
        if (cellType == CellType.STRING) {
            try { return Double.parseDouble(cell.getStringCellValue()); }
            catch (NumberFormatException e) { return 0; }
        }
        return 0;
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private LocalDate parseDate(String raw) {
        if (isBlank(raw)) return null;
        for (String pattern : new String[]{"dd/MM/yyyy", "yyyy-MM-dd", "dd-MM-yyyy", "MM/dd/yyyy"}) {
            try {
                return LocalDate.parse(raw.trim(), DateTimeFormatter.ofPattern(pattern));
            } catch (DateTimeParseException ignored) { /* try next pattern */ }
        }
        log.warn("Could not parse date '{}' — field will be left null.", raw);
        return null;
    }

    private Gender parseGender(String raw) {
        if (isBlank(raw)) return null;
        return switch (raw.trim().toUpperCase()) {
            case "M", "MALE", "HOMME"   -> Gender.MALE;
            case "F", "FEMALE", "FEMME" -> Gender.FEMALE;
            default -> {
                log.warn("Unknown gender value '{}' — field will be left null.", raw);
                yield null;
            }
        };
    }

    private ContractType parseContractType(String raw) {
        if (isBlank(raw)) return null;
        try {
            return ContractType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown contract type '{}' — field will be left null.", raw);
            return null;
        }
    }
}
