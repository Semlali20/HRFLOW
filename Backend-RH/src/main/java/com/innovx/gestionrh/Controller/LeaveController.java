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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "Leave Management", description = "Manage leave types, submit and process leave requests, and track leave balances")
@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    // ── Leave Types ────────────────────────────────────────────────────────────

    @Operation(summary = "Create leave type", description = "Define a new category of leave (e.g. Annual, Sick)")
    @PostMapping("/types")
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> createLeaveType(
            @Valid @RequestBody LeaveTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(leaveService.createLeaveType(request)));
    }

    @Operation(summary = "Update leave type", description = "Modify an existing leave type definition")
    @PutMapping("/types/{id}")
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<ApiResponse<LeaveTypeResponse>> updateLeaveType(
            @PathVariable Long id,
            @Valid @RequestBody LeaveTypeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.updateLeaveType(id, request)));
    }

    @Operation(summary = "List leave types", description = "Retrieve all configured leave types")
    @GetMapping("/types")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<ApiResponse<List<LeaveTypeResponse>>> getAllLeaveTypes() {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getAllLeaveTypes()));
    }

    @Operation(summary = "Delete leave type", description = "Remove a leave type definition")
    @DeleteMapping("/types/{id}")
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<ApiResponse<Void>> deleteLeaveType(@PathVariable Long id) {
        leaveService.deleteLeaveType(id);
        return ResponseEntity.ok(ApiResponse.ok("Leave type deleted successfully."));
    }

    // ── Leave Requests ─────────────────────────────────────────────────────────

    @Operation(summary = "Submit leave request", description = "Submit a new leave request for the authenticated employee")
    @PostMapping
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> submit(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody LeaveRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(leaveService.submit(dto, currentUser.getId())));
    }

    @Operation(summary = "List all leave requests", description = "Paginated list of all leave requests across all employees (requires LEAVE_READ_ALL)")
    @GetMapping
    @PreAuthorize("hasAuthority('LEAVE_READ_ALL')")
    public ResponseEntity<PagedResponse<LeaveRequestResponse>> findAll(
            @PageableDefault(size = 20, sort = "startDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(leaveService.findAll(pageable)));
    }

    @Operation(summary = "List my leave requests", description = "Paginated list of the authenticated user's own leave requests")
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<PagedResponse<LeaveRequestResponse>> findMyRequests(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PageableDefault(size = 20, sort = "startDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(leaveService.findByUser(currentUser.getId(), pageable)));
    }

    @Operation(summary = "List leave requests by user", description = "Paginated list of leave requests for a specific user")
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('LEAVE_READ_ALL')")
    public ResponseEntity<PagedResponse<LeaveRequestResponse>> findByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "startDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(leaveService.findByUser(userId, pageable)));
    }

    @Operation(summary = "Get leave request by ID", description = "Fetch a single leave request by its ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LEAVE_REQUEST', 'LEAVE_READ_ALL')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.findById(id)));
    }

    @Operation(summary = "Approve leave request", description = "Approve a pending leave request (requires LEAVE_APPROVE permission)")
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('LEAVE_APPROVE')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody LeaveDecisionRequest decision) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.approve(id, decision, currentUser.getId())));
    }

    @Operation(summary = "Reject leave request", description = "Reject a pending leave request (requires LEAVE_REJECT permission)")
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('LEAVE_REJECT')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody LeaveDecisionRequest decision) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.reject(id, decision, currentUser.getId())));
    }

    @Operation(summary = "Cancel leave request", description = "Cancel a leave request submitted by the authenticated user")
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.cancel(id, currentUser.getId())));
    }

    // ── Leave Balances ─────────────────────────────────────────────────────────

    @Operation(summary = "Get my leave balances", description = "Returns remaining leave days per type for the authenticated user in a given year")
    @GetMapping("/balance")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getMyBalances(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(defaultValue = "0") int year) {
        int resolvedYear = year > 0 ? year : Year.now().getValue();
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getBalancesForUser(currentUser.getId(), resolvedYear)));
    }

    @Operation(summary = "Get leave balances for user", description = "Returns remaining leave days per type for a specific user in a given year")
    @GetMapping("/balance/{userId}")
    @PreAuthorize("hasAuthority('LEAVE_READ_ALL')")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getBalancesForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int year) {
        int resolvedYear = year > 0 ? year : Year.now().getValue();
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getBalancesForUser(userId, resolvedYear)));
    }

    @Operation(summary = "Initialize leave balance", description = "Manually set the yearly leave balance for a user and leave type")
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
