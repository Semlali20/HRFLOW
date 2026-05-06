package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.EmailService;
import com.innovx.gestionrh.dto.response.ApiResponse;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Admin-only endpoint for sending ad-hoc system emails.
 * Regular transactional emails (welcome, leave approval, etc.) are sent automatically
 * by the corresponding services — this endpoint is only for administrative use.
 */
@RestController
@RequestMapping("/api/v1/admin/emails")
@RequiredArgsConstructor
@Validated
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    @PreAuthorize("hasAuthority('SYSTEM_CONFIG')")
    public ResponseEntity<ApiResponse<Void>> sendEmail(
            @RequestParam @Email String to,
            @RequestParam @NotBlank String subject,
            @RequestParam @NotBlank String message) {
        emailService.sendEmail(to, subject, message);
        return ResponseEntity.ok(ApiResponse.ok("Email sent successfully to: " + to));
    }
}
