package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Department;
import com.innovx.gestionrh.Entity.StageOffer;
import com.innovx.gestionrh.Entity.StageOffer.OfferStatus;
import com.innovx.gestionrh.Repository.CvApplicationRepository;
import com.innovx.gestionrh.Repository.DepartmentRepository;
import com.innovx.gestionrh.Repository.StageOfferRepository;
import com.innovx.gestionrh.Service.StageOfferService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.StageOfferRequest;
import com.innovx.gestionrh.dto.response.StageOfferResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.StageOfferMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StageOfferServiceImpl implements StageOfferService {

    private final StageOfferRepository stageOfferRepository;
    private final DepartmentRepository departmentRepository;
    private final CvApplicationRepository cvApplicationRepository;
    private final StageOfferMapper stageOfferMapper;

    @Override
    @Transactional
    @LogActivity(action = "CREATE", module = "STAGE_OFFER")
    public StageOfferResponse create(StageOfferRequest request) {
        StageOffer offer = stageOfferMapper.toEntity(request);
        resolveDepartment(offer, request.getDepartmentId());
        return enrichWithCount(stageOfferMapper.toResponse(stageOfferRepository.save(offer)));
    }

    @Override
    @Transactional
    @LogActivity(action = "UPDATE", module = "STAGE_OFFER")
    public StageOfferResponse update(Long id, StageOfferRequest request) {
        StageOffer offer = findEntityById(id);

        if (offer.getStatus() == OfferStatus.CLOSED || offer.getStatus() == OfferStatus.CANCELLED) {
            throw new BusinessException("OFFER_CLOSED",
                    "Cannot modify a " + offer.getStatus() + " offer.");
        }

        stageOfferMapper.updateEntity(request, offer);
        resolveDepartment(offer, request.getDepartmentId());
        return enrichWithCount(stageOfferMapper.toResponse(stageOfferRepository.save(offer)));
    }

    @Override
    public StageOfferResponse findById(Long id) {
        return enrichWithCount(stageOfferMapper.toResponse(findEntityById(id)));
    }

    @Override
    public Page<StageOfferResponse> findAll(Pageable pageable) {
        return stageOfferRepository.findAll(pageable)
                .map(offer -> enrichWithCount(stageOfferMapper.toResponse(offer)));
    }

    @Override
    public Page<StageOfferResponse> findByStatus(OfferStatus status, Pageable pageable) {
        return stageOfferRepository.findByStatus(status, pageable)
                .map(offer -> enrichWithCount(stageOfferMapper.toResponse(offer)));
    }

    @Override
    public Page<StageOfferResponse> search(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return findAll(pageable);
        }
        return stageOfferRepository.search(query.trim(), pageable)
                .map(offer -> enrichWithCount(stageOfferMapper.toResponse(offer)));
    }

    @Override
    @Transactional
    @LogActivity(action = "UPDATE_STATUS", module = "STAGE_OFFER")
    public StageOfferResponse updateStatus(Long id, OfferStatus status) {
        StageOffer offer = findEntityById(id);

        if (offer.getStatus() == status) {
            throw new BusinessException("SAME_STATUS",
                    "Offer is already in status '" + status + "'.");
        }
        if (offer.getStatus() == OfferStatus.CANCELLED) {
            throw new BusinessException("OFFER_CANCELLED",
                    "A cancelled offer cannot be updated.");
        }

        offer.setStatus(status);
        return enrichWithCount(stageOfferMapper.toResponse(stageOfferRepository.save(offer)));
    }

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "STAGE_OFFER")
    public void delete(Long id) {
        StageOffer offer = findEntityById(id);

        long applications = cvApplicationRepository.countByOfferId(id);
        if (applications > 0) {
            throw new BusinessException("OFFER_HAS_APPLICATIONS",
                    "Cannot delete offer '" + offer.getTitle() + "': it has "
                    + applications + " application(s). Cancel it instead.");
        }

        stageOfferRepository.delete(offer);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private StageOffer findEntityById(Long id) {
        return stageOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StageOffer", "id", id));
    }

    private void resolveDepartment(StageOffer offer, Long departmentId) {
        if (departmentId != null) {
            Department dept = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", departmentId));
            offer.setDepartment(dept);
        } else {
            offer.setDepartment(null);
        }
    }

    private StageOfferResponse enrichWithCount(StageOfferResponse response) {
        response.setApplicationCount(cvApplicationRepository.countByOfferId(response.getId()));
        return response;
    }
}
