package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.CvApplication.KanbanStage;
import com.innovx.gestionrh.dto.request.KanbanStageUpdateRequest;
import com.innovx.gestionrh.dto.response.CvApplicationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface CvService {

    CvApplicationResponse apply(Long offerId, String candidateName, String candidateEmail,
                                String candidatePhone, MultipartFile cvFile);

    CvApplicationResponse findById(Long id);

    Page<CvApplicationResponse> findAll(Pageable pageable);

    Page<CvApplicationResponse> findByOffer(Long offerId, Pageable pageable);

    Page<CvApplicationResponse> findByStage(KanbanStage stage, Pageable pageable);

    /** Full-text search using PostgreSQL ILIKE on extracted CV text. */
    Page<CvApplicationResponse> searchByText(String keyword, Pageable pageable);

    CvApplicationResponse updateStage(Long id, KanbanStageUpdateRequest request);

    CvApplicationResponse updateScore(Long id, Integer score, String notes);

    void delete(Long id);
}
