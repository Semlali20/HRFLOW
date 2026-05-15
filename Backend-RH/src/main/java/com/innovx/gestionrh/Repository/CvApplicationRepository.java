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

    // JOIN FETCH offer so the lazy proxy is always initialized before the transaction ends
    @Query(value = "SELECT a FROM CvApplication a LEFT JOIN FETCH a.offer",
           countQuery = "SELECT count(a) FROM CvApplication a")
    Page<CvApplication> findAllWithOffer(Pageable pageable);

    @Query(value = "SELECT a FROM CvApplication a LEFT JOIN FETCH a.offer WHERE a.offer.id = :offerId",
           countQuery = "SELECT count(a) FROM CvApplication a WHERE a.offer.id = :offerId")
    Page<CvApplication> findByOfferIdWithOffer(@Param("offerId") Long offerId, Pageable pageable);

    @Query(value = "SELECT a FROM CvApplication a LEFT JOIN FETCH a.offer WHERE a.stage = :stage",
           countQuery = "SELECT count(a) FROM CvApplication a WHERE a.stage = :stage")
    Page<CvApplication> findByStageWithOffer(@Param("stage") KanbanStage stage, Pageable pageable);

    long countByOfferId(Long offerId);

    boolean existsByOfferIdAndCandidateEmail(Long offerId, String candidateEmail);

    @Query(value = "SELECT * FROM cv_applications WHERE extracted_text ILIKE CONCAT('%', :keyword, '%') ORDER BY created_at DESC",
           countQuery = "SELECT count(*) FROM cv_applications WHERE extracted_text ILIKE CONCAT('%', :keyword, '%')",
           nativeQuery = true)
    Page<CvApplication> searchByText(@Param("keyword") String keyword, Pageable pageable);
}
