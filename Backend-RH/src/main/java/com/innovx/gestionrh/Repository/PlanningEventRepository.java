package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.PlanningEvent;
import com.innovx.gestionrh.Entity.PlanningEvent.EventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    Page<PlanningEvent> findByCreatedByIdOrderByStartDateTimeAsc(Long userId, Pageable pageable);

    Page<PlanningEvent> findByTypeOrderByStartDateTimeAsc(EventType type, Pageable pageable);

    @Query("SELECT e FROM PlanningEvent e JOIN e.attendees a WHERE a.id = :userId ORDER BY e.startDateTime")
    List<PlanningEvent> findByAttendeeId(@Param("userId") Long userId);
}
