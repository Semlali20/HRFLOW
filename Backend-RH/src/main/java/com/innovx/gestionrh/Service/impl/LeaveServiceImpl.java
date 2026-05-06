package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.*;
import com.innovx.gestionrh.Repository.*;
import com.innovx.gestionrh.Service.LeaveService;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.dto.request.LeaveDecisionRequest;
import com.innovx.gestionrh.dto.request.LeaveRequestDto;
import com.innovx.gestionrh.dto.request.LeaveTypeRequest;
import com.innovx.gestionrh.dto.response.LeaveBalanceResponse;
import com.innovx.gestionrh.dto.response.LeaveRequestResponse;
import com.innovx.gestionrh.dto.response.LeaveTypeResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.InsufficientLeaveBalanceException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.LeaveMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final UserRepository userRepository;
    private final PublicHolidayRepository publicHolidayRepository;
    private final LeaveMapper leaveMapper;

    private static final String COUNTRY_CODE = "MA";

    // ── LEAVE TYPES ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "CREATE", module = "LEAVE_TYPE")
    public LeaveTypeResponse createLeaveType(LeaveTypeRequest request) {
        if (leaveTypeRepository.existsByName(request.getName())) {
            throw new ConflictException("Leave type '" + request.getName() + "' already exists.");
        }
        LeaveType leaveType = leaveMapper.toEntity(request);
        return leaveMapper.toTypeResponse(leaveTypeRepository.save(leaveType));
    }

    @Override
    @Transactional
    @LogActivity(action = "UPDATE", module = "LEAVE_TYPE")
    public LeaveTypeResponse updateLeaveType(Long id, LeaveTypeRequest request) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", "id", id));

        if (!leaveType.getName().equalsIgnoreCase(request.getName())
                && leaveTypeRepository.existsByName(request.getName())) {
            throw new ConflictException("Leave type '" + request.getName() + "' already exists.");
        }

        leaveMapper.updateEntity(request, leaveType);
        return leaveMapper.toTypeResponse(leaveTypeRepository.save(leaveType));
    }

    @Override
    public List<LeaveTypeResponse> getAllLeaveTypes() {
        return leaveTypeRepository.findAll().stream()
                .map(leaveMapper::toTypeResponse).toList();
    }

    @Override
    @Transactional
    @LogActivity(action = "DELETE", module = "LEAVE_TYPE")
    public void deleteLeaveType(Long id) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", "id", id));
        if (!leaveType.isActive()) {
            throw new BusinessException("ALREADY_INACTIVE",
                    "Leave type '" + leaveType.getName() + "' is already inactive.");
        }
        leaveType.setActive(false);
        leaveTypeRepository.save(leaveType);
    }

    // ── SUBMIT ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "SUBMIT", module = "LEAVE")
    public LeaveRequestResponse submit(LeaveRequestDto dto, Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", requesterId));

        LeaveType leaveType = leaveTypeRepository.findById(dto.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", "id", dto.getLeaveTypeId()));

        if (!leaveType.isActive()) {
            throw new BusinessException("LEAVE_TYPE_INACTIVE",
                    "Leave type '" + leaveType.getName() + "' is not available for requests.");
        }

        validateLeaveDates(dto.getStartDate(), dto.getEndDate());

        // Guard against overlapping pending/approved requests for the same user
        List<LeaveRequest> overlaps = leaveRequestRepository.findOverlapping(
                requesterId, dto.getStartDate(), dto.getEndDate());
        if (!overlaps.isEmpty()) {
            throw new ConflictException(
                    "You already have a " + overlaps.get(0).getStatus()
                    + " leave request that overlaps with the requested period ("
                    + dto.getStartDate() + " to " + dto.getEndDate() + ").");
        }

        int workingDays = countWorkingDays(dto.getStartDate(), dto.getEndDate());
        if (workingDays == 0) {
            throw new BusinessException("NO_WORKING_DAYS",
                    "The selected period contains no working days (all weekends or public holidays).");
        }

        int year = dto.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByUserIdAndLeaveTypeIdAndYear(requesterId, leaveType.getId(), year)
                .orElseThrow(() -> new BusinessException("NO_LEAVE_BALANCE",
                        "No leave balance found for '" + leaveType.getName()
                        + "' in year " + year + ". Please contact HR to initialise your balance."));

        int available = balance.getRemainingDays();
        if (workingDays > available) {
            throw new InsufficientLeaveBalanceException(workingDays, available);
        }

        // Reserve pending days immediately so subsequent submissions see the reduced balance
        leaveBalanceRepository.incrementPendingDays(requesterId, leaveType.getId(), year, workingDays);

        LeaveRequest leaveRequest = leaveMapper.toEntity(dto);
        leaveRequest.setRequester(requester);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setDurationDays(workingDays);
        leaveRequest.setStatus(LeaveStatus.PENDING);

        return leaveMapper.toRequestResponse(leaveRequestRepository.save(leaveRequest));
    }

    // ── APPROVE ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "APPROVE", module = "LEAVE")
    public LeaveRequestResponse approve(Long id, LeaveDecisionRequest decision, Long approverId) {
        LeaveRequest leaveRequest = findEntityById(id);
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", approverId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("LEAVE_NOT_PENDING",
                    "Only PENDING leave requests can be approved. Current status: "
                    + leaveRequest.getStatus() + ".");
        }

        int days = leaveRequest.getDurationDays();
        int year = leaveRequest.getStartDate().getYear();
        Long userId = leaveRequest.getRequester().getId();
        Long typeId = leaveRequest.getLeaveType().getId();

        // Move days: pending → used
        leaveBalanceRepository.decrementPendingDays(userId, typeId, year, days);
        leaveBalanceRepository.incrementUsedDays(userId, typeId, year, days);

        leaveRequest.setStatus(LeaveStatus.APPROVED);
        leaveRequest.setApprover(approver);
        leaveRequest.setApproverComment(decision.getComment());
        leaveRequest.setDecidedAt(LocalDateTime.now());

        return leaveMapper.toRequestResponse(leaveRequestRepository.save(leaveRequest));
    }

    // ── REJECT ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "REJECT", module = "LEAVE")
    public LeaveRequestResponse reject(Long id, LeaveDecisionRequest decision, Long approverId) {
        LeaveRequest leaveRequest = findEntityById(id);
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", approverId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("LEAVE_NOT_PENDING",
                    "Only PENDING leave requests can be rejected. Current status: "
                    + leaveRequest.getStatus() + ".");
        }

        // Release reserved pending days
        leaveBalanceRepository.decrementPendingDays(
                leaveRequest.getRequester().getId(),
                leaveRequest.getLeaveType().getId(),
                leaveRequest.getStartDate().getYear(),
                leaveRequest.getDurationDays());

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        leaveRequest.setApprover(approver);
        leaveRequest.setApproverComment(decision.getComment());
        leaveRequest.setDecidedAt(LocalDateTime.now());

        return leaveMapper.toRequestResponse(leaveRequestRepository.save(leaveRequest));
    }

    // ── CANCEL ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @LogActivity(action = "CANCEL", module = "LEAVE")
    public LeaveRequestResponse cancel(Long id, Long requesterId) {
        LeaveRequest leaveRequest = findEntityById(id);

        if (!leaveRequest.getRequester().getId().equals(requesterId)) {
            throw new BusinessException("NOT_OWNER",
                    "You can only cancel your own leave requests.");
        }
        if (leaveRequest.getStatus() == LeaveStatus.CANCELLED) {
            throw new BusinessException("ALREADY_CANCELLED",
                    "This leave request is already cancelled.");
        }
        if (leaveRequest.getStatus() == LeaveStatus.REJECTED) {
            throw new BusinessException("ALREADY_REJECTED",
                    "A rejected leave request cannot be cancelled.");
        }
        if (leaveRequest.getStatus() == LeaveStatus.APPROVED
                && leaveRequest.getStartDate().isBefore(LocalDate.now())) {
            throw new BusinessException("LEAVE_ALREADY_STARTED",
                    "Cannot cancel a leave that has already started. Please contact HR.");
        }

        int days  = leaveRequest.getDurationDays();
        int year  = leaveRequest.getStartDate().getYear();
        Long uid  = leaveRequest.getRequester().getId();
        Long tid  = leaveRequest.getLeaveType().getId();

        if (leaveRequest.getStatus() == LeaveStatus.PENDING) {
            leaveBalanceRepository.decrementPendingDays(uid, tid, year, days);
        } else if (leaveRequest.getStatus() == LeaveStatus.APPROVED) {
            leaveBalanceRepository.decrementUsedDays(uid, tid, year, days);
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        return leaveMapper.toRequestResponse(leaveRequestRepository.save(leaveRequest));
    }

    // ── QUERIES ───────────────────────────────────────────────────────────────

    @Override
    public LeaveRequestResponse findById(Long id) {
        return leaveMapper.toRequestResponse(findEntityById(id));
    }

    @Override
    public Page<LeaveRequestResponse> findAll(Pageable pageable) {
        return leaveRequestRepository.findAll(pageable)
                .map(leaveMapper::toRequestResponse);
    }

    @Override
    public Page<LeaveRequestResponse> findByUser(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return leaveRequestRepository.findByRequesterId(userId, pageable)
                .map(leaveMapper::toRequestResponse);
    }

    // ── BALANCES ──────────────────────────────────────────────────────────────

    @Override
    public List<LeaveBalanceResponse> getBalancesForUser(Long userId, int year) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        int currentYear = LocalDate.now().getYear();
        if (year < 2000 || year > currentYear + 1) {
            throw new BusinessException("INVALID_YEAR",
                    "Year must be between 2000 and " + (currentYear + 1) + ".");
        }
        return leaveBalanceRepository.findByUserIdAndYear(userId, year)
                .stream().map(leaveMapper::toBalanceResponse).toList();
    }

    @Override
    @Transactional
    @LogActivity(action = "INIT_BALANCE", module = "LEAVE")
    public LeaveBalanceResponse initBalance(Long userId, Long leaveTypeId, int year, int totalDays) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        LeaveType leaveType = leaveTypeRepository.findById(leaveTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", "id", leaveTypeId));

        if (leaveBalanceRepository.existsByUserIdAndLeaveTypeIdAndYear(userId, leaveTypeId, year)) {
            throw new ConflictException("A leave balance for '" + leaveType.getName()
                    + "' in year " + year + " already exists for this user.");
        }
        if (totalDays < 0) {
            throw new BusinessException("INVALID_DAYS",
                    "Total days cannot be negative.");
        }
        if (leaveType.getMaxDaysPerYear() != null && totalDays > leaveType.getMaxDaysPerYear()) {
            throw new BusinessException("EXCEEDS_MAX_DAYS",
                    "Total days (" + totalDays + ") exceeds the maximum allowed ("
                    + leaveType.getMaxDaysPerYear() + ") for '" + leaveType.getName() + "'.");
        }

        LeaveBalance balance = LeaveBalance.builder()
                .user(user)
                .leaveType(leaveType)
                .year(year)
                .totalDays(totalDays)
                .build();

        return leaveMapper.toBalanceResponse(leaveBalanceRepository.save(balance));
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    private LeaveRequest findEntityById(Long id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));
    }

    private void validateLeaveDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new BusinessException("INVALID_DATES", "Start date and end date are required.");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new BusinessException("START_IN_PAST",
                    "Leave start date cannot be in the past.");
        }
        if (endDate.isBefore(startDate)) {
            throw new BusinessException("INVALID_DATE_RANGE",
                    "End date must be on or after start date.");
        }
        if (endDate.isAfter(startDate.plusYears(1))) {
            throw new BusinessException("LEAVE_TOO_LONG",
                    "A single leave request cannot span more than one year.");
        }
    }

    /**
     * Counts working days (Mon–Fri, excluding public holidays) between
     * startDate and endDate inclusive.
     */
    private int countWorkingDays(LocalDate startDate, LocalDate endDate) {
        Set<LocalDate> holidays = Set.copyOf(
                publicHolidayRepository.findHolidayDatesBetween(startDate, endDate, COUNTRY_CODE));
        int workingDays = 0;
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            DayOfWeek dow = current.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY
                    && !holidays.contains(current)) {
                workingDays++;
            }
            current = current.plusDays(1);
        }
        return workingDays;
    }
}
