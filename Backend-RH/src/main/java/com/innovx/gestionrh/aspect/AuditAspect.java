package com.innovx.gestionrh.aspect;

import com.innovx.gestionrh.Entity.AuditLog;
import com.innovx.gestionrh.Repository.AuditLogRepository;
import com.innovx.gestionrh.annotation.LogActivity;
import com.innovx.gestionrh.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.time.LocalDateTime;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    /**
     * Intercepts any method annotated with @LogActivity and persists an audit entry.
     * The log is written asynchronously so it never blocks the business transaction.
     * Failures here are swallowed — audit logging must not break business flows.
     */
    @AfterReturning("@annotation(com.innovx.gestionrh.annotation.LogActivity)")
    public void logActivity(JoinPoint joinPoint) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            LogActivity annotation = method.getAnnotation(LogActivity.class);

            Long   userId    = null;
            String userEmail = "anonymous";

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()
                    && auth.getPrincipal() instanceof UserDetailsImpl ud) {
                userId    = ud.getId();
                userEmail = ud.getEmail();
            }

            String description = annotation.description().isBlank()
                    ? joinPoint.getSignature().getName()
                    : annotation.description();

            AuditLog entry = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .action(annotation.action())
                    .module(annotation.module())
                    .description(description)
                    .ipAddress(resolveClientIp())
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(entry);

        } catch (Exception e) {
            // Audit failures must never propagate to the caller
            log.error("Failed to record audit log for {}: {}", joinPoint.getSignature(), e.getMessage());
        }
    }

    private String resolveClientIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return "unknown";

            HttpServletRequest request = attrs.getRequest();

            // Respect proxy headers — take the first entry from X-Forwarded-For
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                return xff.split(",")[0].trim();
            }
            String realIp = request.getHeader("X-Real-IP");
            if (realIp != null && !realIp.isBlank()) {
                return realIp.trim();
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
