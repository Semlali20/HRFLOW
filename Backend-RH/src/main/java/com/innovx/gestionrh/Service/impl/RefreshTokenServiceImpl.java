package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Entity.RefreshToken;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.RefreshTokenRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.RefreshTokenService;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.exception.TokenExpiredException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Manages the lifecycle of JWT refresh tokens.
 *
 * <p>Exceptions thrown:
 * <ul>
 *   <li>{@link ResourceNotFoundException} — when the target user does not exist</li>
 *   <li>{@link TokenExpiredException} — when a presented refresh token has passed its expiry</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${innovx.app.jwtRefreshExpirationMs}")
    private long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Override
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Reuse the existing row if present (update-or-insert avoids unique-key races)
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElseGet(RefreshToken::new);

        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.debug("Refresh token {} for user id={}.", refreshToken.getId() == null ? "created" : "rotated", userId);
        return saved;
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            log.warn("Refresh token for user id={} has expired and was revoked.",
                    token.getUser().getId());
            throw new TokenExpiredException(
                    "Refresh token has expired. Please log in again to obtain a new session.");
        }
        return token;
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            refreshTokenRepository.deleteByUser(user);
            log.debug("Refresh token revoked for user id={}.", userId);
        });
    }
}
