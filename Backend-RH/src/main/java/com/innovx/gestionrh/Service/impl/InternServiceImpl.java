package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.*;
import com.innovx.gestionrh.Repository.*;
import com.innovx.gestionrh.Service.InternService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.InternDocumentRequest;
import com.innovx.gestionrh.dto.request.InternRequest;
import com.innovx.gestionrh.dto.response.InternDocumentResponse;
import com.innovx.gestionrh.dto.response.InternResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.InternDocumentMapper;
import com.innovx.gestionrh.mapper.InternMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InternServiceImpl implements InternService {

    private final StagiairesRepository stagiaireRepository;
    private final DepartmentRepository departmentRepository;
    private final InternDocumentRepository internDocumentRepository;
    private final MeetingRepository meetingRepository;
    private final InternMapper internMapper;
    private final InternDocumentMapper internDocumentMapper;

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "CREATE", module = "INTERN")
    public InternResponse create(InternRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        if (request.getCin() != null && !request.getCin().isBlank()
                && stagiaireRepository.existsByCin(request.getCin())) {
            throw new ConflictException(
                    "An intern with CIN '" + request.getCin() + "' already exists.");
        }

        Stagiaires intern = internMapper.toEntity(request);
        resolveDepartment(intern, request.getDepartmentId());
        intern.setStatus(InternStatus.ACTIVE);

        Stagiaires saved = stagiaireRepository.save(intern);

        // Initialise document tracking records for all required documents
        initDocumentTracking(saved);

        // Auto-create the standard HR check-in meetings
        createStandardMeetings(saved);

        return enrichResponse(internMapper.toResponse(saved), saved.getId());
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "UPDATE", module = "INTERN")
    public InternResponse update(Long id, InternRequest request) {
        Stagiaires intern = findEntityById(id);

        if (intern.getStatus() == InternStatus.COMPLETED
                || intern.getStatus() == InternStatus.CANCELLED) {
            throw new BusinessException("INTERN_CLOSED",
                    "Cannot modify a " + intern.getStatus() + " internship.");
        }

        validateDates(request.getStartDate(), request.getEndDate());

        // CIN uniqueness — allow updating to the same CIN
        if (request.getCin() != null && !request.getCin().isBlank()
                && !request.getCin().equals(intern.getCin())) {
            if (stagiaireRepository.existsByCin(request.getCin())) {
                throw new ConflictException(
                        "An intern with CIN '" + request.getCin() + "' already exists.");
            }
        }

        internMapper.updateEntity(request, intern);
        resolveDepartment(intern, request.getDepartmentId());

        return enrichResponse(internMapper.toResponse(stagiaireRepository.save(intern)), id);
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    @Override
    public InternResponse findById(Long id) {
        Stagiaires intern = findEntityById(id);
        return enrichResponse(internMapper.toResponse(intern), id);
    }

    @Override
    public Page<InternResponse> findAll(Pageable pageable) {
        return stagiaireRepository.findAll(pageable)
                .map(intern -> enrichResponse(internMapper.toResponse(intern), intern.getId()));
    }

    @Override
    public Page<InternResponse> search(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return findAll(pageable);
        }
        return stagiaireRepository.search(query.trim(), pageable)
                .map(intern -> enrichResponse(internMapper.toResponse(intern), intern.getId()));
    }

    @Override
    public Page<InternResponse> findByStatus(InternStatus status, Pageable pageable) {
        return stagiaireRepository.findByStatus(status, pageable)
                .map(intern -> enrichResponse(internMapper.toResponse(intern), intern.getId()));
    }

    // ── STATUS ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "UPDATE_STATUS", module = "INTERN")
    public InternResponse updateStatus(Long id, InternStatus status) {
        Stagiaires intern = findEntityById(id);

        if (intern.getStatus() == status) {
            throw new BusinessException("SAME_STATUS",
                    "Intern already has status '" + status + "'.");
        }
        // Cannot reopen a completed or cancelled internship
        if ((intern.getStatus() == InternStatus.COMPLETED
                || intern.getStatus() == InternStatus.CANCELLED)
                && status == InternStatus.ACTIVE) {
            throw new BusinessException("CANNOT_REOPEN",
                    "A completed or cancelled internship cannot be reactivated.");
        }

        intern.setStatus(status);
        return enrichResponse(internMapper.toResponse(stagiaireRepository.save(intern)), id);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "INTERN")
    public void delete(Long id) {
        Stagiaires intern = findEntityById(id);

        if (intern.getStatus() == InternStatus.ACTIVE) {
            throw new BusinessException("INTERN_ACTIVE",
                    "Cannot delete an active intern. Cancel or complete the internship first.");
        }

        intern.setDeleted(true);
        stagiaireRepository.save(intern);
        log.info("Intern id={} soft-deleted.", id);
    }

    // ── DOCUMENTS ─────────────────────────────────────────────────────────────

    @Override
    public List<InternDocumentResponse> getDocuments(Long internId) {
        if (!stagiaireRepository.existsById(internId)) {
            throw new ResourceNotFoundException("Intern", "id", internId);
        }
        return internDocumentRepository.findByInternId(internId)
                .stream().map(internDocumentMapper::toResponse).toList();
    }

    @Override
    @Transactional
    @LogActivity(action = "UPDATE_DOCUMENT", module = "INTERN")
    public InternDocumentResponse updateDocument(Long internId, InternDocumentRequest request) {
        Stagiaires intern = findEntityById(internId);

        InternDocument doc = internDocumentRepository
                .findByInternIdAndDocumentType(internId, request.getDocumentType())
                .orElseGet(() -> {
                    InternDocument newDoc = internDocumentMapper.toEntity(request);
                    newDoc.setIntern(intern);
                    return newDoc;
                });

        doc.setSubmitted(request.isSubmitted());
        doc.setSubmittedDate(request.getSubmittedDate());
        doc.setNotes(request.getNotes());

        return internDocumentMapper.toResponse(internDocumentRepository.save(doc));
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    private Stagiaires findEntityById(Long id) {
        return stagiaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intern", "id", id));
    }

    private void resolveDepartment(Stagiaires intern, Long departmentId) {
        if (departmentId != null) {
            Department dept = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", departmentId));
            intern.setDepartment(dept);
        } else {
            intern.setDepartment(null);
        }
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new BusinessException("INVALID_DATES", "Start date and end date are required.");
        }
        if (!endDate.isAfter(startDate)) {
            throw new BusinessException("INVALID_DATE_RANGE",
                    "End date must be after start date.");
        }
        if (startDate.isBefore(LocalDate.now().minusYears(2))) {
            throw new BusinessException("START_DATE_TOO_OLD",
                    "Start date cannot be more than 2 years in the past.");
        }
    }

    /**
     * Creates one InternDocument tracking row per document type
     * so the HR dashboard always shows the full checklist.
     */
    private void initDocumentTracking(Stagiaires intern) {
        for (InternDocumentType type : InternDocumentType.values()) {
            if (!internDocumentRepository.existsByInternIdAndDocumentType(intern.getId(), type)) {
                internDocumentRepository.save(InternDocument.builder()
                        .intern(intern)
                        .documentType(type)
                        .submitted(false)
                        .build());
            }
        }
    }

    /**
     * Auto-creates four standard HR meetings for new interns:
     *  • Day 0  – HR welcome meeting
     *  • Day +7 – first-week check-in
     *  • Month +1 – one-month review
     *  • Month +3 – mid-term evaluation
     * Each meeting is scheduled on the next available weekday if the
     * calculated date falls on a weekend.
     */
    private void createStandardMeetings(Stagiaires intern) {
        LocalDate start = intern.getStartDate();
        List<String[]> templates = Arrays.asList(
                new String[]{"Accueil RH – " + intern.getFirstName() + " " + intern.getLastName(),
                        "ONBOARDING", start.toString()},
                new String[]{"Bilan J+7 – " + intern.getFirstName() + " " + intern.getLastName(),
                        "CHECK_IN", nextWeekday(start.plusDays(7)).toString()},
                new String[]{"Bilan M+1 – " + intern.getFirstName() + " " + intern.getLastName(),
                        "REVIEW", nextWeekday(start.plusMonths(1)).toString()},
                new String[]{"Évaluation M+3 – " + intern.getFirstName() + " " + intern.getLastName(),
                        "EVALUATION", nextWeekday(start.plusMonths(3)).toString()}
        );

        for (String[] tpl : templates) {
            LocalDate meetingDate = LocalDate.parse(tpl[2]);
            // Skip if meeting date falls after internship end
            if (meetingDate.isAfter(intern.getEndDate())) {
                log.debug("Skipping meeting '{}' — date {} is after internship end {}.",
                        tpl[0], meetingDate, intern.getEndDate());
                continue;
            }
            meetingRepository.save(Meeting.builder()
                    .title(tpl[0])
                    .meetingType(tpl[1])
                    .scheduledAt(meetingDate.atTime(9, 0))
                    .status(MeetingStatus.SCHEDULED)
                    .intern(intern)
                    .build());
        }
    }

    /** Returns the date itself if it is a weekday, otherwise advances to Monday. */
    private LocalDate nextWeekday(LocalDate date) {
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY) return date.plusDays(2);
        if (date.getDayOfWeek() == DayOfWeek.SUNDAY)   return date.plusDays(1);
        return date;
    }

    /** Populates document count fields that cannot be derived by MapStruct alone. */
    private InternResponse enrichResponse(InternResponse response, Long internId) {
        long total     = internDocumentRepository.countByInternId(internId);
        long submitted = internDocumentRepository.countByInternIdAndSubmittedTrue(internId);
        response.setTotalDocuments((int) total);
        response.setSubmittedDocuments((int) submitted);
        return response;
    }
}
