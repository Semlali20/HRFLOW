package com.innovx.gestionrh.Service;

import java.io.InputStream;

/**
 * Contract for bulk-importing employee data from Excel files.
 *
 * <p>Exceptions thrown by implementations:
 * <ul>
 *   <li>{@link com.innovx.gestionrh.exception.BusinessException} — if the stream is null,
 *       the workbook has no sheets, or no valid data rows are found</li>
 *   <li>{@link com.innovx.gestionrh.exception.FileStorageException} — if the stream cannot
 *       be parsed as a valid Excel (XLSX / XLS) workbook</li>
 * </ul>
 */
public interface ExcelService {

    /**
     * Parses the given input stream as an Excel workbook and bulk-imports employee rows
     * into the {@code collaborateurs} table.
     *
     * @param inputStream the raw Excel file content; the caller is responsible for closing it
     */
    void importDataFromExcel(InputStream inputStream);
}
