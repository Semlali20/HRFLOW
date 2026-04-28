package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.LeaveBalance;
import com.innovx.gestionrh.Entity.LeaveRequest;
import com.innovx.gestionrh.Entity.LeaveType;
import com.innovx.gestionrh.Service.LeaveService;
import com.innovx.gestionrh.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping("/types")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<List<LeaveType>> getLeaveTypes() {
        return ResponseEntity.ok(leaveService.getActiveLeaveTypes());
    }

    @PostMapping("/types")
    @PreAuthorize("hasAuthority('LEAVE_MANAGE_TYPES')")
    public ResponseEntity<LeaveType> createLeaveType(@RequestBody LeaveType leaveType) {
        return ResponseEntity.ok(leaveService.createLeaveType(leaveType));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LEAVE_READ_ALL')")
    public ResponseEntity<List<LeaveRequest>> getAllRequests() {
        return ResponseEntity.ok(leaveService.getAllRequests());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('LEAVE_APPROVE', 'LEAVE_REJECT')")
    public ResponseEntity<List<LeaveRequest>> getPendingRequests() {
        return ResponseEntity.ok(leaveService.getPendingRequests());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<List<LeaveRequest>> getMyRequests(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(leaveService.getMyRequests(userDetails.getId()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<LeaveRequest> submitRequest(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> body) {
        Long leaveTypeId = Long.parseLong(body.get("leaveTypeId").toString());
        LocalDate start = LocalDate.parse(body.get("startDate").toString());
        LocalDate end = LocalDate.parse(body.get("endDate").toString());
        String reason = (String) body.getOrDefault("reason", "");
        return ResponseEntity.ok(
                leaveService.submitRequest(userDetails.getId(), leaveTypeId, start, end, reason));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('LEAVE_APPROVE')")
    public ResponseEntity<LeaveRequest> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody(required = false) Map<String, String> body) {
        String comment = body != null ? body.getOrDefault("comment", "") : "";
        return ResponseEntity.ok(leaveService.approve(id, userDetails.getId(), comment));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('LEAVE_REJECT')")
    public ResponseEntity<LeaveRequest> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody(required = false) Map<String, String> body) {
        String comment = body != null ? body.getOrDefault("comment", "") : "";
        return ResponseEntity.ok(leaveService.reject(id, userDetails.getId(), comment));
    }

    @GetMapping("/balance")
    @PreAuthorize("hasAuthority('LEAVE_REQUEST')")
    public ResponseEntity<List<LeaveBalance>> getMyBalances(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(leaveService.getMyBalances(userDetails.getId()));
    }
}
