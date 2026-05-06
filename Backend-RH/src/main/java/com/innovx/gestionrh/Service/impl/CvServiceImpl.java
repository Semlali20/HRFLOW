package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.CvApplication;
import com.innovx.gestionrh.Entity.CvApplication.KanbanStage;
import com.innovx.gestionrh.Entity.StageOffer;
import com.innovx.gestionrh.Entity.StageOffer.OfferStatus;
import com.innovx.gestionrh.Repository.CvApplicationRepository;
import com.innovx.gestionrh.Repository.StageOfferRepository;
import com.innovx.gestionrh.Service.CvService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.KanbanStageUpdateRequest;
import com.innovx.gestionrh.dto.response.CvApplicationResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.FileStorageException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.CvMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
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
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CvServiceImpl implements CvService {

    private static final long MAX_CV_SIZE = 5 * 1024 * 1024L; // 5 MB
    private static final Set<String> ALLOWED_CV_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final CvApplicationRepository cvApplicationRepository;
    private final StageOfferRepository stageOfferRepository;
    private final CvMapper cvMapper;
    private final Tika tika;

    @Value("${app.storage.path:./uploads/cv}")
    private String storagePath;

    // ── APPLY ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "APPLY", module = "CV")
    public CvApplicationResponse apply(Long offerId, String candidateName, String candidateEmail,
                                       String candidatePhone, MultipartFile cvFile) {
        StageOffer offer = stageOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("StageOffer", "id", offerId));

        if (offer.getStatus() != OfferStatus.OPEN) {
            throw new BusinessException("OFFER_NOT_OPEN",
                    "This offer is no longer accepting applications (status: " + offer.getStatus() + ").");
        }

        if (offer.getDeadline() != null
                && offer.getDeadline().isBefore(java.time.LocalDate.now())) {
            throw new BusinessException("OFFER_DEADLINE_PASSED",
                    "The application deadline for this offer has passed.");
        }

        // Prevent duplicate applications from the same email for the same offer
        if (candidateEmail != null
                && cvApplicationRepository.existsByOfferIdAndCandidateEmail(offerId, candidateEmail)) {
            throw new ConflictException(
                    "An application from '" + candidateEmail + "' for this offer already exists.");
        }

        if (cvFile == null || cvFile.isEmpty()) {
            throw new BusinessException("NO_CV_FILE", "A CV file is required.");
        }
        if (cvFile.getSize() > MAX_CV_SIZE) {
            throw new BusinessException("CV_TOO_LARGE",
                    "CV file size exceeds the 5 MB limit.");
        }
        String mimeType = cvFile.getContentType();
        if (mimeType == null || !ALLOWED_CV_TYPES.contains(mimeType)) {
            throw new BusinessException("UNSUPPORTED_CV_TYPE",
                    "Only PDF, DOC, and DOCX files are accepted as CV.");
        }

        String originalFilename = StringUtils.cleanPath(
                Objects.requireNonNullElse(cvFile.getOriginalFilename(), "cv"));
        String extension = "";
        int dot = originalFilename.lastIndexOf('.');
        if (dot > 0) extension = originalFilename.substring(dot);
        String storedFilename = UUID.randomUUID() + extension;
        String relativePath = "offer-" + offerId + "/" + storedFilename;

        storeFile(cvFile, relativePath);

        // Extract text for full-text search (PostgreSQL ILIKE replaces Elasticsearch)
        String extractedText = extractText(cvFile);

        CvApplication application = CvApplication.builder()
                .offer(offer)
                .candidateName(candidateName)
                .candidateEmail(candidateEmail)
                .candidatePhone(candidatePhone)
                .cvFileName(originalFilename)
                .cvFilePath(relativePath)
                .extractedText(extractedText)
                .stage(KanbanStage.NEW)
                .build();

        return cvMapper.toResponse(cvApplicationRepository.save(application));
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    @Override
    public CvApplicationResponse findById(Long id) {
        return cvMapper.toResponse(findEntityById(id));
    }

    @Override
    public Page<CvApplicationResponse> findAll(Pageable pageable) {
        return cvApplicationRepository.findAll(pageable)
                .map(cvMapper::toResponse);
    }

    @Override
    public Page<CvApplicationResponse> findByOffer(Long offerId, Pageable pageable) {
        if (!stageOfferRepository.existsById(offerId)) {
            throw new ResourceNotFoundException("StageOffer", "id", offerId);
        }
        return cvApplicationRepository.findByOfferId(offerId, pageable)
                .map(cvMapper::toResponse);
    }

    @Override
    public Page<CvApplicationResponse> findByStage(KanbanStage stage, Pageable pageable) {
        return cvApplicationRepository.findByStage(stage, pageable)
                .map(cvMapper::toResponse);
    }

    @Override
    public Page<CvApplicationResponse> searchByText(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            throw new BusinessException("EMPTY_KEYWORD",
                    "Search keyword cannot be empty.");
        }
        if (keyword.length() < 2) {
            throw new BusinessException("KEYWORD_TOO_SHORT",
                    "Search keyword must be at least 2 characters.");
        }
        return cvApplicationRepository.searchByText(keyword.trim(), pageable)
                .map(cvMapper::toResponse);
    }

    // ── KANBAN STAGE ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "UPDATE_STAGE", module = "CV")
    public CvApplicationResponse updateStage(Long id, KanbanStageUpdateRequest request) {
        CvApplication application = findEntityById(id);

        if (application.getStage() == KanbanStage.REJECTED
                && request.getStage() != KanbanStage.REJECTED) {
            throw new BusinessException("CANNOT_UNREJECTED",
                    "A rejected application cannot be moved to another stage.");
        }

        application.setStage(request.getStage());
        return cvMapper.toResponse(cvApplicationRepository.save(application));
    }

    // ── SCORE / NOTES ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "UPDATE_SCORE", module = "CV")
    public CvApplicationResponse updateScore(Long id, Integer score, String notes) {
        CvApplication application = findEntityById(id);

        if (score != null && (score < 0 || score > 100)) {
            throw new BusinessException("INVALID_SCORE",
                    "Score must be between 0 and 100.");
        }

        application.setScore(score);
        application.setNotes(notes);
        return cvMapper.toResponse(cvApplicationRepository.save(application));
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "CV")
    public void delete(Long id) {
        CvApplication application = findEntityById(id);
        cvApplicationRepository.delete(application);
        try {
            Path path = Paths.get(storagePath).resolve(application.getCvFilePath());
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Could not delete CV file '{}': {}", application.getCvFilePath(), e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private CvApplication findEntityById(Long id) {
        return cvApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CvApplication", "id", id));
    }

    private void storeFile(MultipartFile file, String relativePath) {
        try {
            Path target = Paths.get(storagePath).resolve(relativePath).normalize();
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new FileStorageException("Failed to store CV file: " + e.getMessage(), e);
        }
    }

    /**
     * Extracts plain text from the CV file using Apache Tika.
     * Stored in extracted_text column for PostgreSQL ILIKE search.
     * Failure is non-fatal — we log a warning and store null.
     */
    private String extractText(MultipartFile file) {
        try {
            return tika.parseToString(file.getInputStream());
        } catch (Exception e) {
            log.warn("Text extraction failed for CV '{}': {}", file.getOriginalFilename(), e.getMessage());
            return null;
        }
    }
}
