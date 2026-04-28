package com.innovx.gestionrh.security.jwt;

/**
 * Typed result of a JWT validation check.
 * Carries both the outcome and — on failure — the specific error category,
 * so callers can react differently to an expired token vs a tampered one.
 */
public final class JwtValidationResult {

    public enum JwtError {
        EXPIRED,
        MALFORMED,
        INVALID_SIGNATURE,
        UNSUPPORTED,
        INVALID
    }

    private final boolean valid;
    private final JwtError error;

    private JwtValidationResult(boolean valid, JwtError error) {
        this.valid = valid;
        this.error = error;
    }

    public boolean isValid()        { return valid; }
    public boolean isExpired()      { return JwtError.EXPIRED.equals(error); }
    public JwtError getError()      { return error; }

    public static JwtValidationResult valid()            { return new JwtValidationResult(true,  null); }
    public static JwtValidationResult expired()          { return new JwtValidationResult(false, JwtError.EXPIRED); }
    public static JwtValidationResult malformed()        { return new JwtValidationResult(false, JwtError.MALFORMED); }
    public static JwtValidationResult invalidSignature() { return new JwtValidationResult(false, JwtError.INVALID_SIGNATURE); }
    public static JwtValidationResult unsupported()      { return new JwtValidationResult(false, JwtError.UNSUPPORTED); }
    public static JwtValidationResult invalid()          { return new JwtValidationResult(false, JwtError.INVALID); }
}
