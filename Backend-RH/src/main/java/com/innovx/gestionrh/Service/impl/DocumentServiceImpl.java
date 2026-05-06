package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.Document;
import com.innovx.gestionrh.Entity.DocumentCategory;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.DocumentRepository;
import com.innovx.gestionrh.Service.DocumentService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.DocumentUploadRequest;
import com.innovx.gestionrh.dto.response.DocumentResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.FileStorageException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.DocumentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DocumentServiceImpl implements DocumentService {

    private static final long MAX_FILE_BYTES = 10 * 1024 * 1024L; // 10 MB
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final DocumentRepository documentRepository;
    private final CollaborateursRepository collaborateursRepository;
    private final DocumentMapper documentMapper;

    @Value("${app.storage.path:./uploads/documents}")
    private String storagePath;

    // ── UPLOAD ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "UPLOAD", module = "DOCUMENT")
    public DocumentResponse upload(MultipartFile file, DocumentUploadRequest request) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("EMPTY_FILE", "No file was provided for upload.");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new BusinessException("FILE_TOO_LARGE",
                    "File size (" + file.getSize() / (1024 * 1024) + " MB) exceeds the maximum allowed 10 MB.");
        }

        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new BusinessException("UNSUPPORTED_FILE_TYPE",
                    "File type '" + mimeType + "' is not allowed. "
                    + "Accepted types: PDF, JPEG, PNG, WEBP, DOC, DOCX.");
        }

        Collaborateurs employee = collaborateursRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        if (employee.isDeleted()) {
            throw new BusinessException("EMPLOYEE_TERMINATED",
                    "Cannot upload documents for a terminated employee.");
        }

        // Validate expiry date is in the future if provided
        if (request.getExpiryDate() != null && request.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("EXPIRY_IN_PAST",
                    "Document expiry date cannot be in the past.");
        }

        String originalFilename = StringUtils.cleanPath(
                Objects.requireNonNullElse(file.getOriginalFilename(), "document"));
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }
        String storedFilename = UUID.randomUUID() + extension;
        String relativePath = "employee-" + employee.getId() + "/" + storedFilename;

        storeFile(file, relativePath);

        Document document = Document.builder()
                .employee(employee)
                .originalFilename(originalFilename)
                .storedPath(relativePath)
                .mimeType(mimeType)
                .fileSize(file.getSize())
                .category(request.getCategory())
                .description(request.getDescription())
                .expiryDate(request.getExpiryDate())
                .build();

        return documentMapper.toResponse(documentRepository.save(document));
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    @Override
    public DocumentResponse findById(Long id) {
        return documentMapper.toResponse(
                documentRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id)));
    }

    @Override
    public Page<DocumentResponse> findByEmployee(Long employeeId, Pageable pageable) {
        if (!collaborateursRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", "id", employeeId);
        }
        return documentRepository.findByEmployeeId(employeeId, pageable)
                .map(documentMapper::toResponse);
    }

    @Override
    public List<DocumentResponse> findByEmployeeAndCategory(Long employeeId, DocumentCategory category) {
        if (!collaborateursRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", "id", employeeId);
        }
        return documentRepository.findByEmployeeIdAndCategory(employeeId, category)
                .stream().map(documentMapper::toResponse).toList();
    }

    @Override
    public List<DocumentResponse> findExpiringSoon(int daysAhead) {
        if (daysAhead < 1 || daysAhead > 365) {
            throw new BusinessException("INVALID_DAYS",
                    "Days ahead must be between 1 and 365.");
        }
        LocalDate from = LocalDate.now();
        LocalDate to   = from.plusDays(daysAhead);
        return documentRepository.findExpiringSoon(from, to)
                .stream().map(documentMapper::toResponse).toList();
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "DOCUMENT")
    public void delete(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));

        document.setDeleted(true);
        documentRepository.save(document);

        // Attempt to remove the physical file; log a warning if it fails
        try {
            Path filePath = Paths.get(storagePath).resolve(document.getStoredPath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete file '{}' from storage: {}", document.getStoredPath(), e.getMessage());
        }
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    private void storeFile(MultipartFile file, String relativePath) {
        try {
            Path target = Paths.get(storagePath).resolve(relativePath).normalize();
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored document at '{}'.", target);
        } catch (IOException e) {
            throw new FileStorageException("Failed to store file: " + e.getMessage(), e);
        }
    }
}
