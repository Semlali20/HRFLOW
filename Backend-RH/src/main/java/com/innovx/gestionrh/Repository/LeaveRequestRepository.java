package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.LeaveRequest;
import com.innovx.gestionrh.Entity.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    Page<LeaveRequest> findByRequesterId(Long userId, Pageable pageable);

    Page<LeaveRequest> findByStatus(LeaveStatus status, Pageable pageable);

    List<LeaveRequest> findByRequesterIdAndStatus(Long userId, LeaveStatus status);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.requester.id = :userId " +
           "AND lr.status IN ('PENDING', 'APPROVED') " +
           "AND lr.startDate <= :endDate AND lr.endDate >= :startDate")
    List<LeaveRequest> findOverlapping(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(lr.durationDays) FROM LeaveRequest lr WHERE lr.requester.id = :userId " +
           "AND lr.leaveType.id = :typeId AND lr.status = 'APPROVED' " +
           "AND YEAR(lr.startDate) = :year")
    Integer sumApprovedDays(
            @Param("userId") Long userId,
            @Param("typeId") Long typeId,
            @Param("year") int year);

    long countByRequesterIdAndStatus(Long userId, LeaveStatus status);

    @Query("SELECT lr FROM LeaveRequest lr WHERE YEAR(lr.startDate) = :year ORDER BY lr.startDate ASC")
    List<LeaveRequest> findAllByYear(@Param("year") int year);
}
