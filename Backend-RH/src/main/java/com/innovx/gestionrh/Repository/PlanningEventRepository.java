package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.PlanningEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PlanningEventRepository extends JpaRepository<PlanningEvent, Long> {

    @Query("SELECT e FROM PlanningEvent e WHERE e.startDateTime BETWEEN :from AND :to ORDER BY e.startDateTime")
    List<PlanningEvent> findByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    List<PlanningEvent> findByCreatedByIdOrderByStartDateTimeAsc(Long userId);
}
