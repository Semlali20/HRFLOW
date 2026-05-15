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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CvServiceImpl implements CvService {

    private static final long MAX_CV_SIZE = 5 * 1024 * 1024L; // 5 MB

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}");

    // A single "name word": starts with a letter, contains only letters, hyphens, apostrophes
    private static final Pattern NAME_WORD_PATTERN =
            Pattern.compile("^[\\p{L}][\\p{L}'\\-]*$");

    private static final Set<String> CV_SECTION_KEYWORDS = Set.of(
            "EXPERIENCE", "EDUCATION", "SKILLS", "SUMMARY", "PROFILE", "OBJECTIVE",
            "FORMATION", "COMPÉTENCES", "EXPÉRIENCE", "CONTACT", "REFERENCES", "LANGUAGES",
            "CURRICULUM", "VITAE", "RESUME", "CV", "ABOUT", "ME", "PORTFOLIO",
            "HOBBIES", "INTERESTS", "CERTIFICATIONS", "AWARDS", "PUBLICATIONS"
    );

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
        StageOffer offer = null;

        if (offerId != null) {
            offer = stageOfferRepository.findById(offerId)
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

            if (candidateEmail != null
                    && cvApplicationRepository.existsByOfferIdAndCandidateEmail(offerId, candidateEmail)) {
                throw new ConflictException(
                        "An application from '" + candidateEmail + "' for this offer already exists.");
            }
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
        String folderName = offerId != null ? "offer-" + offerId : "general";
        String relativePath = folderName + "/" + storedFilename;

        storeFile(cvFile, relativePath);

        String extractedText = extractText(cvFile);

        String resolvedName = (candidateName != null && !candidateName.isBlank())
                ? candidateName
                : Objects.requireNonNullElse(parseName(extractedText, originalFilename), "Unknown");
        String resolvedEmail = (candidateEmail != null && !candidateEmail.isBlank())
                ? candidateEmail
                : Objects.requireNonNullElse(parseEmail(extractedText), "");

        CvApplication application = CvApplication.builder()
                .offer(offer)
                .candidateName(resolvedName)
                .candidateEmail(resolvedEmail)
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
        return cvApplicationRepository.findAllWithOffer(pageable)
                .map(cvMapper::toResponse);
    }

    @Override
    public Page<CvApplicationResponse> findByOffer(Long offerId, Pageable pageable) {
        if (!stageOfferRepository.existsById(offerId)) {
            throw new ResourceNotFoundException("StageOffer", "id", offerId);
        }
        return cvApplicationRepository.findByOfferIdWithOffer(offerId, pageable)
                .map(cvMapper::toResponse);
    }

    @Override
    public Page<CvApplicationResponse> findByStage(KanbanStage stage, Pageable pageable) {
        return cvApplicationRepository.findByStageWithOffer(stage, pageable)
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

    /**
     * Parses the first email address found in the extracted CV text.
     */
    private String parseEmail(String text) {
        if (text == null || text.isBlank()) return null;
        Matcher m = EMAIL_PATTERN.matcher(text);
        return m.find() ? m.group().toLowerCase() : null;
    }

    /**
     * Attempts to extract the candidate's full name from the CV text.
     * Strategy: scan the first 15 non-empty lines; pick the first line where
     * every whitespace-delimited token is a "name word" (letters/hyphens/apostrophes only),
     * there are 2–5 tokens, no digits, no special punctuation, and no CV section headers.
     * Falls back to cleaning the filename.
     */
    private String parseName(String text, String filename) {
        if (text != null && !text.isBlank()) {
            String[] lines = text.split("\\r?\\n");
            int checked = 0;
            for (String line : lines) {
                if (checked >= 15) break;
                // Normalise inner whitespace but keep the line intact
                String trimmed = line.trim().replaceAll("\\s+", " ");
                if (trimmed.isEmpty()) continue;
                checked++;

                // Hard disqualifiers
                if (trimmed.length() > 55) continue;
                if (trimmed.contains("@") || trimmed.contains("http")) continue;
                if (trimmed.matches(".*[\\d|/\\\\()\\[\\]{}<>=+*#^].*")) continue;

                String[] words = trimmed.split(" ");
                if (words.length < 2 || words.length > 5) continue;

                // Every word must look like a name token
                boolean allNameWords = true;
                for (String word : words) {
                    if (!NAME_WORD_PATTERN.matcher(word).matches()
                            || CV_SECTION_KEYWORDS.contains(word.toUpperCase())) {
                        allNameWords = false;
                        break;
                    }
                }
                if (allNameWords) return toTitleCase(trimmed);
            }
        }

        // Fallback: clean up the filename
        if (filename != null) {
            String stem = filename
                    .replaceAll("(?i)([-_ ]?(cv|resume|curriculum[-_ ]?vitae)[-_ ]?)", " ")
                    .replaceAll("\\.[^.]+$", "")   // remove extension
                    .replaceAll("[_\\-]+", " ")     // separators → spaces
                    .trim();
            if (!stem.isBlank() && stem.split("\\s+").length >= 2) {
                return toTitleCase(stem);
            }
        }
        return null;
    }

    private String toTitleCase(String input) {
        if (input == null || input.isBlank()) return input;
        StringBuilder sb = new StringBuilder();
        for (String word : input.trim().split("\\s+")) {
            if (word.isEmpty()) continue;
            if (!sb.isEmpty()) sb.append(' ');
            // Handle hyphenated parts: "EL-MEHDI" → "El-Mehdi"
            String[] parts = word.split("-", -1);
            for (int i = 0; i < parts.length; i++) {
                if (i > 0) sb.append('-');
                if (parts[i].isEmpty()) continue;
                sb.append(Character.toUpperCase(parts[i].charAt(0)));
                if (parts[i].length() > 1) sb.append(parts[i].substring(1).toLowerCase());
            }
        }
        return sb.toString();
    }
}
