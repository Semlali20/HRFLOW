package com.innovx.gestionrh.Controller;

/**
 * The old FileController (Tesseract OCR, PDFBox, no security) has been removed.
 *
 * File management is now handled by dedicated, secure controllers:
 *
 *   - Employee documents  → {@code DocumentController} at {@code /api/v1/documents}
 *   - CV uploads          → {@code CvController}       at {@code /api/v1/cvs/upload}
 *
 * Physical file serving (download) will be added to {@code DocumentController}
 * in the next sprint.
 *
 * This stub is kept to prevent merge conflicts. It can be deleted once downstream
 * branches are rebased.
 */
public class FileController {
    // Intentionally empty — see DocumentController and CvController.
}
