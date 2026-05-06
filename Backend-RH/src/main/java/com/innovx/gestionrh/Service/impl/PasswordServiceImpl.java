package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.PasswordService;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Handles password generation, delivery, and mutation.
 *
 * <p>Exceptions thrown:
 * <ul>
 *   <li>{@link BusinessException} — code {@code WRONG_PASSWORD} when the supplied old password
 *       does not match the stored hash</li>
 *   <li>{@link BusinessException} — code {@code WEAK_PASSWORD} when the new password is too short</li>
 *   <li>{@link ResourceNotFoundException} — when a user lookup fails inside helpers</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordServiceImpl implements PasswordService {

    private static final int MIN_PASSWORD_LENGTH = 8;

    private final JavaMailSender emailSender;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── GENERATE ──────────────────────────────────────────────────────────────

    /**
     * Generates a random 8-character alphanumeric temporary password.
     */
    @Override
    public String generatePassword() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, MIN_PASSWORD_LENGTH);
    }

    // ── SEND ──────────────────────────────────────────────────────────────────

    /**
     * Sends a generated password to the specified email address.
     *
     * @param email    the recipient's email address
     * @param password the plain-text password to include in the message
     */
    @Override
    public void sendPasswordByEmail(String email, String password) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("INVALID_EMAIL",
                    "Cannot send password: recipient email must not be blank.");
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your New INNOVX HR Password");
        message.setText("Your temporary password is: " + password
                + "\n\nPlease change it immediately after logging in.");
        emailSender.send(message);
        log.info("Temporary password sent to '{}'.", email);
    }

    // ── CHANGE ────────────────────────────────────────────────────────────────

    /**
     * Verifies {@code oldPassword} against the user's stored hash and, if correct,
     * replaces it with the encoded {@code newPassword}.
     *
     * @param user        the user whose password is being changed
     * @param oldPassword the plain-text current password supplied by the user
     * @param newPassword the desired new plain-text password
     * @throws BusinessException code {@code WRONG_PASSWORD}  — old password mismatch
     * @throws BusinessException code {@code WEAK_PASSWORD}   — new password too short
     * @throws BusinessException code {@code SAME_PASSWORD}   — new password is identical to the current one
     */
    @Override
    public void modifyPassword(User user, String oldPassword, String newPassword) {
        if (user == null) {
            throw new ResourceNotFoundException("User cannot be null for password modification.");
        }
        if (oldPassword == null || oldPassword.isBlank()) {
            throw new BusinessException("MISSING_OLD_PASSWORD",
                    "Current password must not be blank.");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new BusinessException("MISSING_NEW_PASSWORD",
                    "New password must not be blank.");
        }
        if (newPassword.length() < MIN_PASSWORD_LENGTH) {
            throw new BusinessException("WEAK_PASSWORD",
                    "New password must be at least " + MIN_PASSWORD_LENGTH + " characters long.");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("WRONG_PASSWORD",
                    "The current password you entered is incorrect.");
        }
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new BusinessException("SAME_PASSWORD",
                    "The new password must be different from the current password.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setLastPasswordChange(LocalDateTime.now());
        user.setMustChangePassword(false);
        userRepository.save(user);
        log.info("Password changed successfully for user id={}.", user.getId());
    }
}
