//package com.innovx.gestionrh.Service;
//import com.innovx.gestionrh.Entity.Collaborateurs;
//
//import com.innovx.gestionrh.Entity.Collaborateurs;
//import com.innovx.gestionrh.Repository.CollaborateursRepository;
//import lombok.extern.slf4j.Slf4j;
//import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
//import org.apache.poi.ss.usermodel.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.io.IOException;
//import java.io.InputStream;
//import java.time.LocalDate;
//import java.time.format.DateTimeFormatter;
//import java.time.format.DateTimeParseException;
//import java.util.*;
//
//@Service
//@Slf4j
//public class ExcelService {
//    @Autowired
//    private CollaborateursRepository collaborateursRepository;
//
//    public void importDataFromExcel(InputStream inputStream) {
//        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
//            Sheet sheet = workbook.getSheetAt(0); // Assuming data is in the first sheet
//
//            List<Collaborateurs> collaborateursList = new ArrayList<>();
//
//            // Iterate over rows (skip the header row)
//            Iterator<Row> rowIterator = sheet.iterator();
//            rowIterator.next(); // Skip the header row
//
//            while (rowIterator.hasNext()) {
//                Row row = rowIterator.next();
//
//                Collaborateurs collaborateur = new Collaborateurs();
//
//                collaborateur.setMatricule((long) getNumericCellValue(row.getCell(0)));
//                collaborateur.setNom(getStringCellValue(row.getCell(1)));
//                collaborateur.setPrenom(getStringCellValue(row.getCell(2)));
//                collaborateur.setSexe(getStringCellValue(row.getCell(3)));
//                collaborateur.setCIN(getStringCellValue(row.getCell(4)));
//                collaborateur.setNationalité(getStringCellValue(row.getCell(5)));
//                collaborateur.setCATEGORIE(getStringCellValue(row.getCell(6)));
//                collaborateur.setAge((int) getNumericCellValue(row.getCell(7)));
//                collaborateur.setDate_naissance(String.valueOf((row.getCell(8))));
//                collaborateur.setEmail(String.valueOf((row.getCell(9))));
//                collaborateur.setFILIALE(getStringCellValue(row.getCell(10)));
//                collaborateur.setType(getStringCellValue(row.getCell(11)));
//                collaborateur.setDépartement(getStringCellValue(row.getCell(12)));
//                collaborateur.setFonction(getStringCellValue(row.getCell(13)));
//                collaborateur.setDate_entree(String.valueOf((row.getCell(14))));
//                collaborateur.setAncienneté(getNumericCellValue(row.getCell(15)));
//
//                collaborateursList.add(collaborateur);
//            }
//
//            collaborateursRepository.saveAll(collaborateursList); // Save the imported data to the database
//        } catch (IOException | InvalidFormatException e) {
//            log.error("Failed to import data from Excel file.", e);
//            throw new RuntimeException("Failed to import data from Excel file.");
//        }
//    }
//
//
//
//    // Method to validate and format the date
//    private String getStringCellValue(Cell cell) {
//        if (cell == null) {
//            return null;
//        }
//        // Always treat the cell content as a string
//        cell.setCellType(CellType.STRING);
//        return cell.getStringCellValue();
//    }
//
//    private double getNumericCellValue(Cell cell) {
//        if (cell == null) {
//            return 0; // Return default value if cell is null
//        }
//        CellType cellType = CellType.forInt(cell.getCellType());
//        if (cellType == CellType.NUMERIC) {
//            return cell.getNumericCellValue();
//        } else if (cellType == CellType.STRING) {
//            try {
//                return Double.parseDouble(cell.getStringCellValue());
//            } catch (NumberFormatException e) {
//                log.error("Invalid numeric value in cell: " + cell.getStringCellValue());
//                return 0; // Return default value if parsing fails
//            }
//        } else {
//            return 0; // Return default value for other cell types
//        }
//    }
//
//
//
//
//}
package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@Slf4j
public class ExcelService {
    @Autowired
    private CollaborateursRepository collaborateursRepository;

    public void importDataFromExcel(InputStream inputStream) {
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0); // Assuming data is in the first sheet

            List<Collaborateurs> collaborateursList = new ArrayList<>();

            // Iterate over rows (skip the header row)
            Iterator<Row> rowIterator = sheet.iterator();
            rowIterator.next(); // Skip the header row

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();

                Collaborateurs collaborateur = new Collaborateurs();

                collaborateur.setMatricule(getLongCellValue(row.getCell(0))); // Convert to Long
                collaborateur.setNom(getStringCellValue(row.getCell(1)));
                collaborateur.setPrenom(getStringCellValue(row.getCell(2)));
                collaborateur.setSexe(getStringCellValue(row.getCell(3)));
                collaborateur.setCIN(getStringCellValue(row.getCell(4)));
                collaborateur.setNationalité(getStringCellValue(row.getCell(5)));
                collaborateur.setCATEGORIE(getStringCellValue(row.getCell(6)));
                collaborateur.setAge((int) getNumericCellValue(row.getCell(7)));
                collaborateur.setDate_naissance(getStringCellValue(row.getCell(8)));
                collaborateur.setEmail(getStringCellValue(row.getCell(9)));
                collaborateur.setFILIALE(getStringCellValue(row.getCell(10)));
                collaborateur.setType(getStringCellValue(row.getCell(11)));
                collaborateur.setDépartement(getStringCellValue(row.getCell(12)));
                collaborateur.setFonction(getStringCellValue(row.getCell(13)));
                collaborateur.setDate_entree(getStringCellValue(row.getCell(14)));
                collaborateur.setAncienneté((int) getNumericCellValue(row.getCell(15)));

                collaborateursList.add(collaborateur);
            }

            collaborateursRepository.saveAll(collaborateursList); // Save the imported data to the database


        } catch (IOException | InvalidFormatException e) {
            log.error("Failed to import data from Excel file.", e);
            throw new RuntimeException("Failed to import data from Excel file.");
        }
    }
    private Long getLongCellValue(Cell cell) {
        if (cell == null) {
            return null; // Return null if cell is empty
        }
        try {
            return (long) cell.getNumericCellValue(); // Assume the value is numeric and convert to Long
        } catch (Exception e) {
            try {
                return Long.parseLong(cell.getStringCellValue()); // Attempt to parse from String
            } catch (NumberFormatException ex) {
                log.error("Invalid long value in cell: " + cell.getStringCellValue());
                return null; // Return null if parsing fails
            }
        }
    }


    // Helper methods
    private String getStringCellValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue();
    }

    private double getNumericCellValue(Cell cell) {
        if (cell == null) {
            return 0; // Return default value if cell is null
        }
        CellType cellType = CellType.forInt(cell.getCellType());
        if (cellType == CellType.NUMERIC) {
            return cell.getNumericCellValue();
        } else if (cellType == CellType.STRING) {
            try {
                return Double.parseDouble(cell.getStringCellValue());
            } catch (NumberFormatException e) {
                log.error("Invalid numeric value in cell: " + cell.getStringCellValue());
                return 0; // Return default value if parsing fails
            }
        } else {
            return 0; // Return default value for other cell types
        }
    }
}
