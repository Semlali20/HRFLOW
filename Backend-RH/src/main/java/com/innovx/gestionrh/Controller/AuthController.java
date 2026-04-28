package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Entity.RefreshToken;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.Service.EmailService;
import com.innovx.gestionrh.Service.PasswordService;
import com.innovx.gestionrh.Service.RefreshTokenService;
import com.innovx.gestionrh.payload.request.LoginRequest;
import com.innovx.gestionrh.payload.request.TokenRefreshRequest;
import com.innovx.gestionrh.payload.response.JwtResponse;
import com.innovx.gestionrh.payload.response.MessageResponse;
import com.innovx.gestionrh.security.jwt.JwtUtils;
import com.innovx.gestionrh.security.services.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    RefreshTokenService refreshTokenService;

    @Autowired
    PasswordService passwordService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    EmailService emailService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            return ResponseEntity.ok(userRepository.findAll());
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            log.info("Login attempt for: {}", loginRequest.getEmail());
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String accessToken = jwtUtils.generateJwtToken(authentication);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

            List<String> permissions = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            log.info("Login successful for: {}", loginRequest.getEmail());
            return ResponseEntity.ok(new JwtResponse(
                    accessToken,
                    refreshToken.getToken(),
                    userDetails.getId(),
                    userDetails.getLastname(),
                    userDetails.getFirstname(),
                    userDetails.getEmail(),
                    userDetails.getTitle(),
                    userDetails.getUserRole(),
                    permissions));

        } catch (AuthenticationException e) {
            log.error("Authentication failed for {}: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Invalid email or password"));
        } catch (Exception e) {
            log.error("Unexpected error during login for {}", loginRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Internal server error"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String newAccessToken = jwtUtils.generateTokenForEmail(user.getEmail());
                    return ResponseEntity.ok(new MessageResponse(newAccessToken));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Refresh token not found")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl userDetails) {
            refreshTokenService.deleteByUserId(userDetails.getId());
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new MessageResponse("Logout successful"));
    }

    @PutMapping("/password")
    public ResponseEntity<String> modifyPassword(@RequestParam String email,
                                                  @RequestParam String oldPassword,
                                                  @RequestParam String newPassword) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé");
        }
        try {
            passwordService.modifyPassword(optionalUser.get(), oldPassword, newPassword);
            return ResponseEntity.ok("Mot de passe modifié avec succès");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        try {
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("User with this email already exists");
            }

            String newPassword = passwordService.generatePassword();
            user.setPassword(encoder.encode(newPassword));
            user.setLastPasswordChange(LocalDateTime.now());
            userRepository.save(user);

            String emailBody = "Bonjour " + user.getLastName() + " " + user.getFirstName() + ",\n\n"
                    + "Bienvenue sur notre plateforme INNOVX.\n\n"
                    + "Vos informations de connexion :\n"
                    + "Email : " + user.getEmail() + "\n"
                    + "Mot de passe : " + newPassword + "\n\n"
                    + "Veuillez changer votre mot de passe lors de votre première connexion.\n\n"
                    + "Cordialement,\nL'équipe RH INNOVX";

            emailService.sendEmail(user.getEmail(), "Bienvenue sur notre plateforme INNOVX", emailBody);
            return ResponseEntity.ok("User created successfully. Password sent to the user's email.");

        } catch (Exception e) {
            log.error("Error registering user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to register user: " + e.getMessage());
        }
    }
}
