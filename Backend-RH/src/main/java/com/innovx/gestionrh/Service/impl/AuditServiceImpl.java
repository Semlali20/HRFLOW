package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Repository.AuditLogRepository;
import com.innovx.gestionrh.Service.AuditService;
import com.innovx.gestionrh.dto.response.AuditLogResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.mapper.AuditLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    // ── ALL ───────────────────────────────────────────────────────────────────

    @Override
    public Page<AuditLogResponse> findAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable)
                .map(auditLogMapper::toResponse);
    }

    // ── BY USER ───────────────────────────────────────────────────────────────

    @Override
    public Page<AuditLogResponse> findByUser(String email, Pageable pageable) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("INVALID_EMAIL",
                    "User email must not be blank.");
        }
        return auditLogRepository.findByUserEmailOrderByTimestampDesc(email.trim(), pageable)
                .map(auditLogMapper::toResponse);
    }

    // ── BY MODULE ─────────────────────────────────────────────────────────────

    @Override
    public Page<AuditLogResponse> findByModule(String module, Pageable pageable) {
        if (module == null || module.isBlank()) {
            throw new BusinessException("INVALID_MODULE",
                    "Module name must not be blank.");
        }
        return auditLogRepository.findByModuleOrderByTimestampDesc(module.trim().toUpperCase(), pageable)
                .map(auditLogMapper::toResponse);
    }

    // ── BY ACTION ─────────────────────────────────────────────────────────────

    @Override
    public Page<AuditLogResponse> findByAction(String action, Pageable pageable) {
        if (action == null || action.isBlank()) {
            throw new BusinessException("INVALID_ACTION",
                    "Action name must not be blank.");
        }
        return auditLogRepository.findByActionOrderByTimestampDesc(action.trim().toUpperCase(), pageable)
                .map(auditLogMapper::toResponse);
    }

    // ── BY DATE RANGE ─────────────────────────────────────────────────────────

    @Override
    public Page<AuditLogResponse> findByDateRange(LocalDateTime from, LocalDateTime to, Pageable pageable) {
        if (from == null || to == null) {
            throw new BusinessException("INVALID_DATE_RANGE",
                    "Both 'from' and 'to' date-time parameters are required.");
        }
        if (to.isBefore(from)) {
            throw new BusinessException("INVALID_DATE_RANGE",
                    "'to' must not be before 'from'. Provided: from=" + from + ", to=" + to + ".");
        }
        if (from.isAfter(LocalDateTime.now())) {
            throw new BusinessException("FUTURE_DATE_RANGE",
                    "'from' date cannot be in the future.");
        }
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(from, to, pageable)
                .map(auditLogMapper::toResponse);
    }
}
