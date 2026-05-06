package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.dto.response.AuditLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

/**
 * Contract for querying the append-only audit log.
 * Write operations (inserts) are handled exclusively by {@link com.innovx.gestionrh.aspect.AuditAspect}
 * and are intentionally absent from this interface — the audit trail must never be
 * mutated through the service layer.
 */
public interface AuditService {

    /**
     * Returns all audit log entries, ordered by timestamp descending.
     */
    Page<AuditLogResponse> findAll(Pageable pageable);

    /**
     * Returns all audit entries produced by a specific user (matched by email).
     *
     * @throws com.innovx.gestionrh.exception.ResourceNotFoundException if no entries exist for the email
     *         (the email format is validated; the check is advisory — returns empty page otherwise)
     */
    Page<AuditLogResponse> findByUser(String email, Pageable pageable);

    /**
     * Returns all audit entries for a given application module (e.g. "LEAVE", "COLLABORATEUR").
     */
    Page<AuditLogResponse> findByModule(String module, Pageable pageable);

    /**
     * Returns all audit entries for a given action (e.g. "CREATE", "DELETE").
     */
    Page<AuditLogResponse> findByAction(String action, Pageable pageable);

    /**
     * Returns all audit entries whose timestamp falls within [from, to] inclusive.
     *
     * @throws com.innovx.gestionrh.exception.BusinessException if {@code to} is before {@code from},
     *         or if either parameter is null.
     */
    Page<AuditLogResponse> findByDateRange(LocalDateTime from, LocalDateTime to, Pageable pageable);
}
