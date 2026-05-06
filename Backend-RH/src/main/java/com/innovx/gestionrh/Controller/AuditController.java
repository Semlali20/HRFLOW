package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.AuditService;
import com.innovx.gestionrh.dto.response.AuditLogResponse;
import com.innovx.gestionrh.dto.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> findAll(
            @PageableDefault(size = 50, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(auditService.findAll(pageable)));
    }

    @GetMapping("/user/{email}")
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> findByUser(
            @PathVariable String email,
            @PageableDefault(size = 50, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(auditService.findByUser(email, pageable)));
    }

    @GetMapping("/module/{module}")
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> findByModule(
            @PathVariable String module,
            @PageableDefault(size = 50, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(auditService.findByModule(module, pageable)));
    }

    @GetMapping("/action/{action}")
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> findByAction(
            @PathVariable String action,
            @PageableDefault(size = 50, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(auditService.findByAction(action, pageable)));
    }

    @GetMapping("/range")
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    public ResponseEntity<PagedResponse<AuditLogResponse>> findByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @PageableDefault(size = 50, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(PagedResponse.of(auditService.findByDateRange(from, to, pageable)));
    }
}
