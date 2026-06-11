package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.request.PerformanceReviewRequest;
import com.innovx.gestionrh.dto.response.PerformanceReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PerformanceReviewService {

    PerformanceReviewResponse create(PerformanceReviewRequest request);

    PerformanceReviewResponse update(Long id, PerformanceReviewRequest request);

    PerformanceReviewResponse getById(Long id);

    Page<PerformanceReviewResponse> getAll(Pageable pageable);

    List<PerformanceReviewResponse> getByCollaborateur(Long collaborateurId);

    PerformanceReviewResponse submit(Long id);

    void delete(Long id);
}
