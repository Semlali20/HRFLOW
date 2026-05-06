package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.request.LeaveDecisionRequest;
import com.innovx.gestionrh.dto.request.LeaveRequestDto;
import com.innovx.gestionrh.dto.request.LeaveTypeRequest;
import com.innovx.gestionrh.dto.response.LeaveBalanceResponse;
import com.innovx.gestionrh.dto.response.LeaveRequestResponse;
import com.innovx.gestionrh.dto.response.LeaveTypeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LeaveService {

    // ── Leave Types ──────────────────────────────────────────────────────────

    LeaveTypeResponse createLeaveType(LeaveTypeRequest request);

    LeaveTypeResponse updateLeaveType(Long id, LeaveTypeRequest request);

    List<LeaveTypeResponse> getAllLeaveTypes();

    void deleteLeaveType(Long id);

    // ── Leave Requests ───────────────────────────────────────────────────────

    LeaveRequestResponse submit(LeaveRequestDto dto, Long requesterId);

    LeaveRequestResponse approve(Long id, LeaveDecisionRequest decision, Long approverId);

    LeaveRequestResponse reject(Long id, LeaveDecisionRequest decision, Long approverId);

    LeaveRequestResponse cancel(Long id, Long requesterId);

    LeaveRequestResponse findById(Long id);

    Page<LeaveRequestResponse> findAll(Pageable pageable);

    Page<LeaveRequestResponse> findByUser(Long userId, Pageable pageable);

    // ── Leave Balances ───────────────────────────────────────────────────────

    List<LeaveBalanceResponse> getBalancesForUser(Long userId, int year);

    LeaveBalanceResponse initBalance(Long userId, Long leaveTypeId, int year, int totalDays);
}
