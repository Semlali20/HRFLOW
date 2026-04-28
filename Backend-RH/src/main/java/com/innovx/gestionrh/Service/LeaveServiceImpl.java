package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.*;
import com.innovx.gestionrh.Entity.LeaveRequest.LeaveStatus;
import com.innovx.gestionrh.Repository.*;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public List<LeaveType> getActiveLeaveTypes() {
        try {
            return leaveTypeRepository.findByActiveTrue();
        } catch (Exception e) {
            log.error("Failed to fetch active leave types: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch leave types", e);
        }
    }

    @Override
    @Transactional
    public LeaveType createLeaveType(LeaveType leaveType) {
        try {
            if (leaveType.getName() == null || leaveType.getName().isBlank()) {
                throw new BusinessException("INVALID_LEAVE_TYPE", "Leave type name must not be empty");
            }
            return leaveTypeRepository.save(leaveType);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to create leave type '{}': {}", leaveType.getName(), e.getMessage(), e);
            throw new RuntimeException("Failed to create leave type", e);
        }
    }

    @Override
    public List<LeaveRequest> getAllRequests() {
        try {
            return leaveRequestRepository.findAllByOrderByCreatedAtDesc();
        } catch (Exception e) {
            log.error("Failed to fetch all leave requests: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch leave requests", e);
        }
    }

    @Override
    public List<LeaveRequest> getMyRequests(Long userId) {
        try {
            return leaveRequestRepository.findByRequesterIdOrderByCreatedAtDesc(userId);
        } catch (Exception e) {
            log.error("Failed to fetch leave requests for user id={}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch your leave requests", e);
        }
    }

    @Override
    public List<LeaveRequest> getPendingRequests() {
        try {
            return leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING);
        } catch (Exception e) {
            log.error("Failed to fetch pending leave requests: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch pending requests", e);
        }
    }

    @Override
    @Transactional
    @LogActivity(action = "CREATE", module = "LEAVE", description = "Submitted leave request")
    public LeaveRequest submitRequest(Long requesterId, Long leaveTypeId,
                                      LocalDate start, LocalDate end, String reason) {
        try {
            if (start == null || end == null) {
                throw new BusinessException("INVALID_DATES", "Start date and end date are required");
            }
            if (end.isBefore(start)) {
                throw new BusinessException("INVALID_DATE_RANGE", "End date must be after or equal to start date");
            }

            User requester = userRepository.findById(requesterId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", requesterId));
            LeaveType leaveType = leaveTypeRepository.findById(leaveTypeId)
                    .orElseThrow(() -> new ResourceNotFoundException("LeaveType", "id", leaveTypeId));

            int duration = countWorkingDays(start, end);
            if (duration == 0) {
                throw new BusinessException("NO_WORKING_DAYS", "The selected period contains no working days");
            }

            LeaveRequest request = LeaveRequest.builder()
                    .requester(requester)
                    .leaveType(leaveType)
                    .startDate(start)
                    .endDate(end)
                    .durationDays(duration)
                    .reason(reason)
                    .build();

            request = leaveRequestRepository.save(request);
            log.info("Leave request submitted by user id={} for {} working days", requesterId, duration);

            userRepository.findByRoleName("MANAGER").forEach(manager ->
                    notificationService.push(manager,
                            "Demande de congé",
                            requester.getFirstName() + " " + requester.getLastName() + " a soumis une demande de congé",
                            NotificationType.LEAVE_REQUEST));

            return request;
        } catch (BusinessException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to submit leave request for user id={}: {}", requesterId, e.getMessage(), e);
            throw new RuntimeException("Failed to submit leave request", e);
        }
    }

    @Override
    @Transactional
    @LogActivity(action = "APPROVE", module = "LEAVE", description = "Approved leave request")
    public LeaveRequest approve(Long requestId, Long approverId, String comment) {
        return decide(requestId, approverId, comment, LeaveStatus.APPROVED);
    }

    @Override
    @Transactional
    @LogActivity(action = "REJECT", module = "LEAVE", description = "Rejected leave request")
    public LeaveRequest reject(Long requestId, Long approverId, String comment) {
        return decide(requestId, approverId, comment, LeaveStatus.REJECTED);
    }

    @Override
    public List<LeaveBalance> getMyBalances(Long userId) {
        try {
            return leaveBalanceRepository.findByUserId(userId);
        } catch (Exception e) {
            log.error("Failed to fetch leave balances for user id={}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch leave balances", e);
        }
    }

    private LeaveRequest decide(Long requestId, Long approverId, String comment, LeaveStatus status) {
        try {
            LeaveRequest request = leaveRequestRepository.findById(requestId)
                    .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", requestId));

            if (request.getStatus() != LeaveStatus.PENDING) {
                throw new BusinessException("ALREADY_DECIDED",
                        "This leave request has already been " + request.getStatus().name().toLowerCase());
            }

            User approver = userRepository.findById(approverId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", approverId));

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

            log.info("Leave request id={} {} by approver id={}", requestId, status.name(), approverId);
            return leaveRequestRepository.save(request);
        } catch (BusinessException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to process leave decision for request id={}: {}", requestId, e.getMessage(), e);
            throw new RuntimeException("Failed to process leave decision", e);
        }
    }

    private void updateBalance(LeaveRequest request) {
        try {
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
        } catch (Exception e) {
            log.error("Failed to update leave balance for request id={}: {}", request.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update leave balance", e);
        }
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
}
