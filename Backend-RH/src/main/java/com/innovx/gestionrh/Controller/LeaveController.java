package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.LeaveService;
import com.innovx.gestionrh.dto.request.LeaveDecisionRequest;
import com.innovx.gestionrh.dto.request.LeaveRequestDto;
import com.innovx.gestionrh.dto.request.LeaveTypeRequest;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.dto.response.LeaveBalanceResponse;
import com.innovx.gestionrh.dto.response.LeaveRequestResponse;
import com.innovx.gestionrh.dto.response.LeaveTypeResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import com.innovx.gestionrh.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    // ── Leave Types ────────────────────────────────────────────────────────────

    @PostMapping("/types")
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> createLeaveType(
            @Valid @RequestBody LeaveTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(leaveService.createLeaveType(request)));
    }

    @PutMapping("/types/{id}")
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> updateLeaveType(
            @PathVariable Long id,
            @Valid @RequestBody LeaveTypeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.updateLeaveType(id, request)));
    }

    @GetMapping("/types")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<ApiResponse<List<LeaveTypeResponse>>> getAllLeaveTypes() {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getAllLeaveTypes()));
    }

    @DeleteMapping("/types/{id}")
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<ApiResponse<Void>> deleteLeaveType(@PathVariable Long id) {
        leaveService.deleteLeaveType(id);
        return ResponseEntity.ok(ApiResponse.ok("Leave type deleted successfully."));
    }

    // ── Leave Requests ─────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> submit(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody LeaveRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(leaveService.submit(dto, currentUser.getId())));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LEAVE_READ_ALL')")
    public ResponseEntity<PagedResponse<LeaveRequestResponse>> findAll(
            @PageableDefault(size = 20, sort = "startDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(leaveService.findAll(pageable)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<PagedResponse<LeaveRequestResponse>> findMyRequests(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PageableDefault(size = 20, sort = "startDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(leaveService.findByUser(currentUser.getId(), pageable)));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('LEAVE_READ_ALL')")
    public ResponseEntity<PagedResponse<LeaveRequestResponse>> findByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "startDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(leaveService.findByUser(userId, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LEAVE_REQUEST', 'LEAVE_READ_ALL')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.findById(id)));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('LEAVE_APPROVE')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody LeaveDecisionRequest decision) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.approve(id, decision, currentUser.getId())));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('LEAVE_REJECT')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody LeaveDecisionRequest decision) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.reject(id, decision, currentUser.getId())));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.cancel(id, currentUser.getId())));
    }

    // ── Leave Balances ─────────────────────────────────────────────────────────

    @GetMapping("/balance")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getMyBalances(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(defaultValue = "0") int year) {
        int resolvedYear = year > 0 ? year : Year.now().getValue();
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getBalancesForUser(currentUser.getId(), resolvedYear)));
    }

    @GetMapping("/balance/{userId}")
    @PreAuthorize("hasAuthority('LEAVE_READ_ALL')")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getBalancesForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int year) {
        int resolvedYear = year > 0 ? year : Year.now().getValue();
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getBalancesForUser(userId, resolvedYear)));
    }

    @PostMapping("/balance/init")
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<ApiResponse<LeaveBalanceResponse>> initBalance(
            @RequestParam Long userId,
            @RequestParam Long leaveTypeId,
            @RequestParam int year,
            @RequestParam int totalDays) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(leaveService.initBalance(userId, leaveTypeId, year, totalDays)));
    }
}
