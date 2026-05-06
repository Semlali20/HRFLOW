package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    List<LeaveBalance> findByUserId(Long userId);

    List<LeaveBalance> findByUserIdAndYear(Long userId, int year);

    Optional<LeaveBalance> findByUserIdAndLeaveTypeIdAndYear(Long userId, Long leaveTypeId, int year);

    boolean existsByUserIdAndLeaveTypeIdAndYear(Long userId, Long leaveTypeId, int year);

    /** Atomically add days to usedDays when a leave is approved. */
    @Modifying
    @Query("UPDATE LeaveBalance lb SET lb.usedDays = lb.usedDays + :days " +
           "WHERE lb.user.id = :userId AND lb.leaveType.id = :typeId AND lb.year = :year")
    int incrementUsedDays(
            @Param("userId") Long userId,
            @Param("typeId") Long typeId,
            @Param("year") int year,
            @Param("days") int days);

    /** Atomically subtract days from usedDays when a leave is cancelled/rejected. */
    @Modifying
    @Query("UPDATE LeaveBalance lb SET lb.usedDays = lb.usedDays - :days " +
           "WHERE lb.user.id = :userId AND lb.leaveType.id = :typeId AND lb.year = :year " +
           "AND lb.usedDays >= :days")
    int decrementUsedDays(
            @Param("userId") Long userId,
            @Param("typeId") Long typeId,
            @Param("year") int year,
            @Param("days") int days);

    /** Track pending days while leave is awaiting approval. */
    @Modifying
    @Query("UPDATE LeaveBalance lb SET lb.pendingDays = lb.pendingDays + :days " +
           "WHERE lb.user.id = :userId AND lb.leaveType.id = :typeId AND lb.year = :year")
    int incrementPendingDays(
            @Param("userId") Long userId,
            @Param("typeId") Long typeId,
            @Param("year") int year,
            @Param("days") int days);

    @Modifying
    @Query("UPDATE LeaveBalance lb SET lb.pendingDays = lb.pendingDays - :days " +
           "WHERE lb.user.id = :userId AND lb.leaveType.id = :typeId AND lb.year = :year " +
           "AND lb.pendingDays >= :days")
    int decrementPendingDays(
            @Param("userId") Long userId,
            @Param("typeId") Long typeId,
            @Param("year") int year,
            @Param("days") int days);
}
