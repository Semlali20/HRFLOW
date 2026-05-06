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
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

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
    public ResponseEntity<MessageResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        RefreshToken verified = refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .orElseThrow(() -> new BusinessException("INVALID_REFRESH_TOKEN",
                        "Refresh token is invalid or not found. Please log in again."));

        String newAccessToken = jwtUtils.generateAccessTokenForEmail(verified.getUser().getEmail());
        return ResponseEntity.ok(new MessageResponse(newAccessToken));
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
