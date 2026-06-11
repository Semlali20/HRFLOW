package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.PerformanceReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    Page<PerformanceReview> findByCollaborateurId(Long collaborateurId, Pageable pageable);
    List<PerformanceReview> findByCollaborateurId(Long collaborateurId);
    boolean existsByCollaborateurIdAndReviewPeriod(Long collaborateurId, String period);
}
