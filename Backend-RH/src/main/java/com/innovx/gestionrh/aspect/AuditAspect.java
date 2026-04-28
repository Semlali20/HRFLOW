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

    @AfterReturning("@annotation(com.innovx.gestionrh.annotation.LogActivity)")
    public void logActivity(JoinPoint joinPoint) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            LogActivity logActivity = method.getAnnotation(LogActivity.class);

            Long userId = null;
            String userEmail = "anonymous";

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl userDetails) {
                userId = userDetails.getId();
                userEmail = userDetails.getEmail();
            }

            String ipAddress = extractClientIp();

            String description = logActivity.description().isBlank()
                    ? joinPoint.getSignature().getName()
                    : logActivity.description();

            AuditLog entry = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .action(logActivity.action())
                    .module(logActivity.module())
                    .description(description)
                    .ipAddress(ipAddress)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to record audit log", e);
        }
    }

    private String extractClientIp() {
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) return "unknown";
            HttpServletRequest request = attributes.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
