package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.LeaveRequest;
import com.innovx.gestionrh.Entity.LeaveRequest.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByRequesterIdOrderByCreatedAtDesc(Long userId);
    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveStatus status);
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();
}
