package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/emails")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public String sendEmail(@RequestParam String to,
                            @RequestParam String subject,
                            @RequestParam String message) {
        try {
            emailService.sendEmail(to, subject, message);
            return "Email sent successfully to: " + to;
        } catch (Exception e) {
            return "Failed to send email to: " + to + ". Error: " + e.getMessage();
        }
    }
}
