package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Repository.AuditLogRepository;
import com.innovx.gestionrh.Repository.NotificationRepository;
import com.innovx.gestionrh.Repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    /** Run at 02:00 every day — delete expired refresh tokens. */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanExpiredRefreshTokens() {
        int count = refreshTokenRepository.deleteExpiredTokens(Instant.now());
        log.info("[Cleanup] Deleted {} expired refresh tokens", count);
    }

    /** Run at 03:00 every day — delete notifications older than 30 days. */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanOldNotifications() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        int count = notificationRepository.deleteOlderThan(cutoff);
        log.info("[Cleanup] Deleted {} notifications older than 30 days", count);
    }

    /** Run at 04:00 on the 1st of every month — delete audit logs older than 90 days. */
    @Scheduled(cron = "0 0 4 1 * *")
    @Transactional
    public void archiveOldAuditLogs() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(90);
        int count = auditLogRepository.deleteOlderThan(cutoff);
        log.info("[Cleanup] Deleted {} audit log entries older than 90 days", count);
    }
}
