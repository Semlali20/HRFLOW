package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.Meeting;
import com.innovx.gestionrh.Entity.MeetingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    Page<Meeting> findByOrganizerId(Long organizerId, Pageable pageable);

    List<Meeting> findByInternId(Long internId);

    Page<Meeting> findByStatus(MeetingStatus status, Pageable pageable);

    @Query("SELECT m FROM Meeting m WHERE m.scheduledAt BETWEEN :from AND :to ORDER BY m.scheduledAt")
    List<Meeting> findByScheduledAtBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT m FROM Meeting m JOIN m.participants p WHERE p.id = :userId ORDER BY m.scheduledAt")
    List<Meeting> findByParticipantId(@Param("userId") Long userId);
}
