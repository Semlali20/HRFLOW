package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.*;
import com.innovx.gestionrh.Entity.LeaveRequest.LeaveStatus;
import com.innovx.gestionrh.Repository.*;
import com.innovx.gestionrh.annotation.LogActivity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<LeaveType> getActiveLeaveTypes() {
        return leaveTypeRepository.findByActiveTrue();
    }

    @Transactional
    public LeaveType createLeaveType(LeaveType leaveType) {
        return leaveTypeRepository.save(leaveType);
    }

    public List<LeaveRequest> getAllRequests() {
        return leaveRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<LeaveRequest> getMyRequests(Long userId) {
        return leaveRequestRepository.findByRequesterIdOrderByCreatedAtDesc(userId);
    }

    public List<LeaveRequest> getPendingRequests() {
        return leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING);
    }

    @Transactional
    @LogActivity(action = "CREATE", module = "LEAVE", description = "Submitted leave request")
    public LeaveRequest submitRequest(Long requesterId, Long leaveTypeId,
                                      LocalDate start, LocalDate end, String reason) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LeaveType leaveType = leaveTypeRepository.findById(leaveTypeId)
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        int duration = countWorkingDays(start, end);

        LeaveRequest request = LeaveRequest.builder()
                .requester(requester)
                .leaveType(leaveType)
                .startDate(start)
                .endDate(end)
                .durationDays(duration)
                .reason(reason)
                .build();

        request = leaveRequestRepository.save(request);

        // Notify managers
        userRepository.findByRoleName("MANAGER").forEach(manager ->
                notificationService.push(manager,
                        "Demande de congé",
                        requester.getFirstName() + " " + requester.getLastName() + " a soumis une demande de congé",
                        NotificationType.LEAVE_REQUEST));

        return request;
    }

    @Transactional
    @LogActivity(action = "APPROVE", module = "LEAVE", description = "Approved leave request")
    public LeaveRequest approve(Long requestId, Long approverId, String comment) {
        return decide(requestId, approverId, comment, LeaveStatus.APPROVED);
    }

    @Transactional
    @LogActivity(action = "REJECT", module = "LEAVE", description = "Rejected leave request")
    public LeaveRequest reject(Long requestId, Long approverId, String comment) {
        return decide(requestId, approverId, comment, LeaveStatus.REJECTED);
    }

    private LeaveRequest decide(Long requestId, Long approverId, String comment, LeaveStatus status) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        request.setStatus(status);
        request.setApprover(approver);
        request.setApproverComment(comment);
        request.setDecidedAt(LocalDateTime.now());

        if (status == LeaveStatus.APPROVED) {
            updateBalance(request);
            notificationService.push(request.getRequester(), "Congé approuvé",
                    "Votre demande de congé a été approuvée", NotificationType.LEAVE_APPROVED);
        } else {
            notificationService.push(request.getRequester(), "Congé refusé",
                    "Votre demande de congé a été refusée. " + comment, NotificationType.LEAVE_REJECTED);
        }

        return leaveRequestRepository.save(request);
    }

    private void updateBalance(LeaveRequest request) {
        int year = request.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByUserIdAndLeaveTypeIdAndYear(
                        request.getRequester().getId(),
                        request.getLeaveType().getId(), year)
                .orElseGet(() -> LeaveBalance.builder()
                        .user(request.getRequester())
                        .leaveType(request.getLeaveType())
                        .year(year)
                        .totalDays(request.getLeaveType().getMaxDaysPerYear() != null
                                ? request.getLeaveType().getMaxDaysPerYear() : 30)
                        .usedDays(0)
                        .build());
        balance.setUsedDays(balance.getUsedDays() + request.getDurationDays());
        leaveBalanceRepository.save(balance);
    }

    private int countWorkingDays(LocalDate start, LocalDate end) {
        int count = 0;
        LocalDate date = start;
        while (!date.isAfter(end)) {
            if (date.getDayOfWeek() != DayOfWeek.SATURDAY && date.getDayOfWeek() != DayOfWeek.SUNDAY) {
                count++;
            }
            date = date.plusDays(1);
        }
        return count;
    }

    public List<LeaveBalance> getMyBalances(Long userId) {
        return leaveBalanceRepository.findByUserId(userId);
    }
}
