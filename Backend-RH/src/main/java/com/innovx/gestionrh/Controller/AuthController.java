package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.RefreshToken;
import com.innovx.gestionrh.Entity.Role;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.RoleRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.EmailService;
import com.innovx.gestionrh.Service.PasswordService;
import com.innovx.gestionrh.Service.RefreshTokenService;
import com.innovx.gestionrh.dto.response.ApiResponse;
import com.innovx.gestionrh.exception.BusinessException;
import com.innovx.gestionrh.exception.ConflictException;
import com.innovx.gestionrh.exception.ResourceNotFoundException;
import com.innovx.gestionrh.payload.request.LoginRequest;
import com.innovx.gestionrh.payload.request.PasswordChangeRequest;
import com.innovx.gestionrh.payload.request.SignupRequest;
import com.innovx.gestionrh.payload.request.TokenRefreshRequest;
import com.innovx.gestionrh.payload.response.JwtResponse;
import com.innovx.gestionrh.payload.response.MessageResponse;
import com.innovx.gestionrh.payload.response.TokenRefreshResponse;
import com.innovx.gestionrh.security.jwt.JwtUtils;
import com.innovx.gestionrh.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    // ── OTP store: email → (code, expiry) ────────────────────────────────────
    private record OtpEntry(String code, LocalDateTime expiresAt) {}
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private static final int OTP_TTL_MINUTES = 2;

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final PasswordService passwordService;
    private final EmailService emailService;

    // ── LOGIN ─────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String accessToken = jwtUtils.generateAccessToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        List<String> roles = List.of(userDetails.getUserRole());
        List<String> permissions = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .sorted()
                .collect(Collectors.toList());

        log.info("User '{}' logged in.", userDetails.getEmail());

        return ResponseEntity.ok(JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .id(userDetails.getId())
                .firstName(userDetails.getFirstname())
                .lastName(userDetails.getLastname())
                .email(userDetails.getEmail())
                .title(userDetails.getTitle())
                .roles(roles)
                .permissions(permissions)
                .mustChangePassword(userDetails.isMustChangePassword())
                .build());
    }

    // ── CURRENT USER ──────────────────────────────────────────────────────────

    /**
     * Returns the caller's current role + permissions, freshly loaded from DB.
     * Frontend polls this every ~60 s to pick up permission changes without re-login.
     */
    @GetMapping("/me")
    public ResponseEntity<JwtResponse> getCurrentUser(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        List<String> permissions = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .sorted()
                .collect(Collectors.toList());

        return ResponseEntity.ok(JwtResponse.builder()
                .id(currentUser.getId())
                .firstName(currentUser.getFirstname())
                .lastName(currentUser.getLastname())
                .email(currentUser.getEmail())
                .title(currentUser.getTitle())
                .roles(List.of(currentUser.getUserRole()))
                .permissions(permissions)
                .mustChangePassword(currentUser.isMustChangePassword())
                .build());
    }

    // ── REGISTER ──────────────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with email '" + request.getEmail() + "' already exists.");
        }

        String roleName = (request.getRoles() != null && !request.getRoles().isEmpty())
                ? request.getRoles().iterator().next()
                : "ROLE_USER";
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));

        String tempPassword = passwordService.generatePassword();

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .title(request.getTitle())
                .password(passwordEncoder.encode(tempPassword))
                .mustChangePassword(true)
                .lastPasswordChange(LocalDateTime.now())
                .roles(Set.of(role))
                .build();

        userRepository.save(user);

        // Send welcome email with temporary password
        try {
            emailService.sendEmail(
                    user.getEmail(),
                    "Welcome to INNOVX HR Platform",
                    buildWelcomeEmail(user.getFirstName(), user.getLastName(), user.getEmail(), tempPassword));
        } catch (Exception e) {
            log.warn("Failed to send welcome email to '{}': {}", user.getEmail(), e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully. A temporary password has been sent to "
                        + user.getEmail() + "."));
    }

    // ── REFRESH ───────────────────────────────────────────────────────────────

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        RefreshToken verified = refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .orElseThrow(() -> new BusinessException("INVALID_REFRESH_TOKEN",
                        "Refresh token is invalid or not found. Please log in again."));

        String newAccessToken  = jwtUtils.generateAccessTokenForEmail(verified.getUser().getEmail());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(verified.getUser().getId());

        return ResponseEntity.ok(new TokenRefreshResponse(newAccessToken, newRefreshToken.getToken()));
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser != null) {
            refreshTokenService.deleteByUserId(currentUser.getId());
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully."));
    }

    // ── PASSWORD CHANGE ───────────────────────────────────────────────────────

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody PasswordChangeRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        passwordService.modifyPassword(user, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully."));
    }

    // ── FORGOT PASSWORD — step 1: send OTP ───────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new BusinessException("MISSING_EMAIL", "Email is required.");
        }
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String code = String.format("%06d", new Random().nextInt(1_000_000));
        otpStore.put(email, new OtpEntry(code, LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES)));

        emailService.sendEmail(email, "Your WIKOHR password reset code",
                "Your verification code is: " + code + "\n\nThis code expires in " + OTP_TTL_MINUTES + " minutes.");

        log.info("OTP sent to '{}'.", email);
        return ResponseEntity.ok(ApiResponse.ok("Verification code sent to " + email));
    }

    // ── FORGOT PASSWORD — step 2: verify OTP ─────────────────────────────────

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code  = body.get("otp");
        OtpEntry entry = otpStore.get(email);

        if (entry == null || !entry.code().equals(code)) {
            throw new BusinessException("INVALID_OTP", "The code you entered is incorrect.");
        }
        if (LocalDateTime.now().isAfter(entry.expiresAt())) {
            otpStore.remove(email);
            throw new BusinessException("EXPIRED_OTP", "This code has expired. Please request a new one.");
        }
        return ResponseEntity.ok(ApiResponse.ok("Code verified."));
    }

    // ── FORGOT PASSWORD — step 3: reset password ──────────────────────────────

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, String> body) {
        String email       = body.get("email");
        String code        = body.get("otp");
        String newPassword = body.get("newPassword");

        OtpEntry entry = otpStore.get(email);
        if (entry == null || !entry.code().equals(code)) {
            throw new BusinessException("INVALID_OTP", "Invalid or expired code.");
        }
        if (LocalDateTime.now().isAfter(entry.expiresAt())) {
            otpStore.remove(email);
            throw new BusinessException("EXPIRED_OTP", "This code has expired. Please request a new one.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new BusinessException("WEAK_PASSWORD", "Password must be at least 8 characters.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        user.setLastPasswordChange(LocalDateTime.now());
        userRepository.save(user);
        otpStore.remove(email);

        log.info("Password reset for '{}'.", email);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully."));
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private String buildWelcomeEmail(String firstName, String lastName, String email, String password) {
        return "Hello " + firstName + " " + lastName + ",\n\n"
                + "Welcome to the INNOVX HR platform.\n\n"
                + "Your login credentials:\n"
                + "Email: " + email + "\n"
                + "Temporary password: " + password + "\n\n"
                + "Please change your password upon first login.\n\n"
                + "Best regards,\nThe INNOVX HR Team";
    }
}
