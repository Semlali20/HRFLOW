package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.PerformanceReview;
import com.innovx.gestionrh.Entity.PerformanceReview.ReviewStatus;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.PerformanceReviewRepository;
import com.innovx.gestionrh.Service.PerformanceReviewService;
import com.innovx.gestionrh.dto.request.PerformanceReviewRequest;
import com.innovx.gestionrh.dto.response.PerformanceReviewResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PerformanceReviewServiceImpl implements PerformanceReviewService {

    private final PerformanceReviewRepository reviewRepo;
    private final CollaborateursRepository collaborateursRepo;

    @Override
    @Transactional
    public PerformanceReviewResponse create(PerformanceReviewRequest request) {
        Collaborateurs collab = collaborateursRepo.findById(request.getCollaborateurId())
            .orElseThrow(() -> new ResourceNotFoundException("Collaborateur", "id", request.getCollaborateurId()));

        if (reviewRepo.existsByCollaborateurIdAndReviewPeriod(request.getCollaborateurId(), request.getReviewPeriod())) {
            throw new BusinessException("REVIEW_DUPLICATE",
                "A review for this period already exists for this employee.");
        }

        PerformanceReview review = PerformanceReview.builder()
            .collaborateur(collab)
            .reviewPeriod(request.getReviewPeriod())
            .reviewDate(request.getReviewDate())
            .status(ReviewStatus.DRAFT)
            .technicalScore(request.getTechnicalScore())
            .communicationScore(request.getCommunicationScore())
            .teamworkScore(request.getTeamworkScore())
            .initiativeScore(request.getInitiativeScore())
            .attendanceScore(request.getAttendanceScore())
            .strengths(request.getStrengths())
            .improvements(request.getImprovements())
            .goals(request.getGoals())
            .reviewerNotes(request.getReviewerNotes())
            .reviewerName(request.getReviewerName())
            .build();

        return toResponse(reviewRepo.save(review));
    }

    @Override
    @Transactional
    public PerformanceReviewResponse update(Long id, PerformanceReviewRequest request) {
        PerformanceReview review = findEntityById(id);

        if (review.getStatus() == ReviewStatus.SUBMITTED) {
            throw new BusinessException("REVIEW_SUBMITTED", "Cannot edit a submitted review.");
        }

        review.setTechnicalScore(request.getTechnicalScore());
        review.setCommunicationScore(request.getCommunicationScore());
        review.setTeamworkScore(request.getTeamworkScore());
        review.setInitiativeScore(request.getInitiativeScore());
        review.setAttendanceScore(request.getAttendanceScore());
        review.setStrengths(request.getStrengths());
        review.setImprovements(request.getImprovements());
        review.setGoals(request.getGoals());
        review.setReviewerNotes(request.getReviewerNotes());
        review.setReviewerName(request.getReviewerName());

        return toResponse(reviewRepo.save(review));
    }

    @Override
    public PerformanceReviewResponse getById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    public Page<PerformanceReviewResponse> getAll(Pageable pageable) {
        return reviewRepo.findAll(pageable).map(this::toResponse);
    }

    @Override
    public List<PerformanceReviewResponse> getByCollaborateur(Long collaborateurId) {
        if (!collaborateursRepo.existsById(collaborateurId)) {
            throw new ResourceNotFoundException("Collaborateur", "id", collaborateurId);
        }
        return reviewRepo.findByCollaborateurId(collaborateurId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PerformanceReviewResponse submit(Long id) {
        PerformanceReview review = findEntityById(id);
        review.setStatus(ReviewStatus.SUBMITTED);
        return toResponse(reviewRepo.save(review));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!reviewRepo.existsById(id)) {
            throw new ResourceNotFoundException("PerformanceReview", "id", id);
        }
        reviewRepo.deleteById(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private PerformanceReview findEntityById(Long id) {
        return reviewRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));
    }

    private PerformanceReviewResponse toResponse(PerformanceReview r) {
        String name = r.getCollaborateur() != null
            ? (r.getCollaborateur().getFirstName() + " " + r.getCollaborateur().getLastName())
            : "";
        return PerformanceReviewResponse.builder()
            .id(r.getId())
            .collaborateurId(r.getCollaborateur() != null ? r.getCollaborateur().getId() : null)
            .collaborateurName(name)
            .reviewPeriod(r.getReviewPeriod())
            .reviewDate(r.getReviewDate())
            .status(r.getStatus())
            .technicalScore(r.getTechnicalScore())
            .communicationScore(r.getCommunicationScore())
            .teamworkScore(r.getTeamworkScore())
            .initiativeScore(r.getInitiativeScore())
            .attendanceScore(r.getAttendanceScore())
            .overallScore(r.getOverallScore())
            .strengths(r.getStrengths())
            .improvements(r.getImprovements())
            .goals(r.getGoals())
            .reviewerNotes(r.getReviewerNotes())
            .reviewerName(r.getReviewerName())
            .build();
    }
}
