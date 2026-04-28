package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.CvApplication;
import com.innovx.gestionrh.Entity.CvApplication.KanbanStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CvApplicationRepository extends JpaRepository<CvApplication, Long> {
    List<CvApplication> findByStage(KanbanStage stage);
    List<CvApplication> findByOfferId(Long offerId);
    List<CvApplication> findAllByOrderBySubmittedAtDesc();
}
