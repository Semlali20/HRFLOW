package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.RefreshToken;

import java.util.Optional;

/**
 * Contract for managing the lifecycle of JWT refresh tokens.
 *
 * <p>Exceptions thrown by implementations:
 * <ul>
 *   <li>{@link com.innovx.gestionrh.exception.ResourceNotFoundException} — when the target user
 *       does not exist</li>
 *   <li>{@link com.innovx.gestionrh.exception.TokenExpiredException} — when a presented refresh
 *       token has passed its expiry date</li>
 * </ul>
 */
public interface RefreshTokenService {

    /**
     * Looks up a refresh token by its opaque token string.
     *
     * @return an {@link Optional} containing the token entity, or empty if not found
     */
    Optional<RefreshToken> findByToken(String token);

    /**
     * Creates (or replaces) a refresh token for the given user.
     * Any previously issued token for that user is revoked first (one-token-per-user policy).
     *
     * @param userId the primary key of the user for whom the token is issued
     * @throws com.innovx.gestionrh.exception.ResourceNotFoundException if no user with
     *         {@code userId} exists
     */
    RefreshToken createRefreshToken(Long userId);

    /**
     * Verifies that the given refresh token has not expired.
     * If expired, the token is deleted and a {@link com.innovx.gestionrh.exception.TokenExpiredException}
     * is thrown.
     *
     * @param token the token entity to verify
     * @return the same token entity if it is still valid
     * @throws com.innovx.gestionrh.exception.TokenExpiredException if the token's expiry is past
     */
    RefreshToken verifyExpiration(RefreshToken token);

    /**
     * Revokes the refresh token associated with the given user (logout / token rotation).
     * Silently does nothing if the user has no active token.
     *
     * @param userId the primary key of the user whose token should be revoked
     */
    void deleteByUserId(Long userId);
}
