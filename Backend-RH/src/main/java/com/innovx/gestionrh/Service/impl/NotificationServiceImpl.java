package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.Notification;
import com.innovx.gestionrh.Entity.NotificationType;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.NotificationRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.NotificationService;
import com.innovx.gestionrh.dto.response.NotificationResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.mapper.NotificationMapper;
import com.innovx.gestionrh.notification.SseEmitterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final SseEmitterRegistry sseEmitterRegistry;

    @Override
    @Transactional
    public void send(Long recipientId, String title, String message,
                     NotificationType type, String actionUrl) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", recipientId));

        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(type)
                .actionUrl(actionUrl)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = notificationMapper.toResponse(saved);

        // Push via SSE if the user is currently connected
        try {
            sseEmitterRegistry.sendToUser(recipientId.toString(), response);
        } catch (Exception e) {
            log.warn("SSE push failed for user id={} — will rely on polling. Cause: {}",
                    recipientId, e.getMessage());
        }
    }

    @Override
    public Page<NotificationResponse> getForUser(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toResponse);
    }

    @Override
    public long countUnread(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        // Verify ownership before marking — prevents one user reading another's notifications
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new BusinessException("NOT_OWNER",
                    "You can only mark your own notifications as read.");
        }
        if (notification.isRead()) {
            return; // idempotent — no-op if already read
        }
        notificationRepository.markOneRead(notificationId, userId);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        notificationRepository.markAllReadByRecipientId(userId);
    }

    @Override
    @Transactional
    public void delete(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new BusinessException("NOT_OWNER",
                    "You can only delete your own notifications.");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void clearRead(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        notificationRepository.deleteReadByRecipientId(userId);
    }
}
