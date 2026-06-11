package com.innovx.gestionrh.security.jwt;

import com.innovx.gestionrh.security.services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Enterprise-grade JWT utility.
 *
 * Design decisions:
 *  - The signing key is built once at startup (@PostConstruct) and cached —
 *    avoids rebuilding the key on every request.
 *  - Every token carries jti (unique ID), iss (issuer), and a "type" claim
 *    so the token's purpose is always verifiable without an extra DB call.
 *  - Validation returns a typed {@link JwtValidationResult} instead of a
 *    boolean so the filter / entry-point can react differently to an expired
 *    token vs. a tampered one.
 *  - No deprecated SignatureAlgorithm.forName() usage — uses the HS256 enum
 *    value directly (valid in jjwt 0.11.x).
 */
@Component
@Slf4j
public class JwtUtils {

    public static final String ISSUER      = "HRFLOW-INNOVX";
    public static final String CLAIM_TYPE  = "type";
    public static final String TYPE_ACCESS = "access";
    public static final String CLAIM_UID   = "uid";

    @Value("${innovx.app.jwtSecret}")
    private String jwtSecret;

    @Value("${innovx.app.jwtExpirationMs}")
    private long jwtExpirationMs;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret is too short — must be at least 256 bits (32 characters). " +
                    "Update 'innovx.app.jwtSecret' in application.properties.");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        log.info("JWT signing key initialized ({} bytes)", keyBytes.length);
    }

    // -----------------------------------------------------------------------
    // Token generation
    // -----------------------------------------------------------------------

    /** Generates an access token for an already-authenticated principal. */
    public String generateAccessToken(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        return buildAccessToken(principal.getEmail(), principal.getId());
    }

    /** Generates an access token by email only (used on token refresh). */
    public String generateAccessTokenForEmail(String email) {
        return buildAccessToken(email, null);
    }

    private String buildAccessToken(String subject, Long userId) {
        JwtBuilder builder = Jwts.builder()
                .setId(UUID.randomUUID().toString())   // jti — unique per token
                .setSubject(subject)
                .setIssuer(ISSUER)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .claim(CLAIM_TYPE, TYPE_ACCESS);

        if (userId != null) {
            builder.claim(CLAIM_UID, userId);
        }

        return builder.signWith(signingKey, SignatureAlgorithm.HS256).compact();
    }

    // -----------------------------------------------------------------------
    // Token parsing
    // -----------------------------------------------------------------------

    /** Extracts the email (subject) from a raw token string. Never call on an unvalidated token. */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /** Returns all claims. Throws a JwtException subtype if the token is invalid. */
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .requireIssuer(ISSUER)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // -----------------------------------------------------------------------
    // Token validation
    // -----------------------------------------------------------------------

    /**
     * Returns a typed {@link JwtValidationResult} — preferred over the boolean
     * overload because it lets the caller react to individual failure modes.
     */
    public JwtValidationResult validateToken(String token) {
        if (!StringUtils.hasText(token)) {
            return JwtValidationResult.invalid();
        }
        try {
            extractAllClaims(token);
            return JwtValidationResult.valid();
        } catch (ExpiredJwtException e) {
            log.debug("JWT token is expired: {}", e.getMessage());
            return JwtValidationResult.expired();
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
            return JwtValidationResult.invalidSignature();
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token: {}", e.getMessage());
            return JwtValidationResult.malformed();
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT token: {}", e.getMessage());
            return JwtValidationResult.unsupported();
        } catch (Exception e) {
            log.warn("JWT validation error: {}", e.getMessage());
            return JwtValidationResult.invalid();
        }
    }

    /** Boolean convenience wrapper — kept for backward compatibility. */
    public boolean validateJwtToken(String token) {
        return validateToken(token).isValid();
    }

    // -----------------------------------------------------------------------
    // Request helpers
    // -----------------------------------------------------------------------

    /** Extracts the Bearer token from the Authorization header. */
    public String extractTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        // Note: the former access_token query-param fallback for SSE has been removed.
        // SSE authentication now uses short-lived tickets via POST /api/v1/auth/sse-ticket
        // so that JWT tokens are never exposed in URLs / server access logs (S-006).
        return null;
    }

    /** @deprecated Use {@link #extractEmail(String)} instead. */
    @Deprecated(forRemoval = true)
    public String getUserNameFromJwtToken(String token) {
        return extractEmail(token);
    }

    /** @deprecated Use {@link #extractTokenFromRequest(HttpServletRequest)} instead. */
    @Deprecated(forRemoval = true)
    public String getJwtFromRequest(HttpServletRequest request) {
        return extractTokenFromRequest(request);
    }

    /** @deprecated Use {@link #generateAccessToken(Authentication)} instead. */
    @Deprecated(forRemoval = true)
    public String generateJwtToken(Authentication authentication) {
        return generateAccessToken(authentication);
    }

    /** @deprecated Use {@link #generateAccessTokenForEmail(String)} instead. */
    @Deprecated(forRemoval = true)
    public String generateTokenForEmail(String email) {
        return generateAccessTokenForEmail(email);
    }
}
