package com.innovx.gestionrh.Repository;

import com.innovx.gestionrh.Entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByOrderByTimestampDesc(Pageable pageable);
    List<AuditLog> findByUserEmailOrderByTimestampDesc(String email);
    List<AuditLog> findByModuleOrderByTimestampDesc(String module);
    List<AuditLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime from, LocalDateTime to);
}
