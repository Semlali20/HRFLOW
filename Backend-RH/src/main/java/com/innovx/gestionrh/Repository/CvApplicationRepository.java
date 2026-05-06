package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.CvApplication;
import com.innovx.gestionrh.Entity.CvApplication.KanbanStage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CvApplicationRepository extends JpaRepository<CvApplication, Long> {

    Page<CvApplication> findByOfferId(Long offerId, Pageable pageable);

    Page<CvApplication> findByStage(KanbanStage stage, Pageable pageable);

    long countByOfferId(Long offerId);

    boolean existsByOfferIdAndCandidateEmail(Long offerId, String candidateEmail);

    /**
     * Full-text search against extracted CV text using PostgreSQL ILIKE.
     * Replaces the Elasticsearch-based search that was previously used.
     */
    @Query(value = "SELECT * FROM cv_applications WHERE extracted_text ILIKE CONCAT('%', :keyword, '%') ORDER BY created_at DESC",
           countQuery = "SELECT count(*) FROM cv_applications WHERE extracted_text ILIKE CONCAT('%', :keyword, '%')",
           nativeQuery = true)
    Page<CvApplication> searchByText(@Param("keyword") String keyword, Pageable pageable);
}
