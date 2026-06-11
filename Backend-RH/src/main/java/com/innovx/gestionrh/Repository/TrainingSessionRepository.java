package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.TrainingSession;
import com.innovx.gestionrh.Entity.TrainingSession.TrainingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TrainingSessionRepository extends JpaRepository<TrainingSession, Long> {

    Page<TrainingSession> findByStatus(TrainingStatus status, Pageable pageable);

    @Query("SELECT t FROM TrainingSession t JOIN t.participants p WHERE p.id = :collabId")
    List<TrainingSession> findByParticipantId(@Param("collabId") Long collabId);
}
