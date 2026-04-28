package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.AuditLog;
import com.innovx.gestionrh.Repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(
                auditLogRepository.findByOrderByTimestampDesc(
                        PageRequest.of(page, size, Sort.by("timestamp").descending())));
    }

    @GetMapping("/user/{email}")
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    public ResponseEntity<List<AuditLog>> getByUser(@PathVariable String email) {
        return ResponseEntity.ok(auditLogRepository.findByUserEmailOrderByTimestampDesc(email));
    }

    @GetMapping("/module/{module}")
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    public ResponseEntity<List<AuditLog>> getByModule(@PathVariable String module) {
        return ResponseEntity.ok(auditLogRepository.findByModuleOrderByTimestampDesc(module));
    }

    @GetMapping("/range")
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    public ResponseEntity<List<AuditLog>> getByDateRange(
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to) {
        return ResponseEntity.ok(
                auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(from, to));
    }
}
