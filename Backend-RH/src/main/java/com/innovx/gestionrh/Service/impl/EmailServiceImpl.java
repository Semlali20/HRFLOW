package com.innovx.gestionrh.Service.impl;

import com.innovx.gestionrh.Service.EmailService;
import com.innovx.gestionrh.exception.EmailSendException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Plain-text email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send plain-text email to '{}': {}", to, e.getMessage(), e);
            throw new EmailSendException(to, e.getMessage(), e);
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String templateName,
                              Map<String, Object> variables) throws MessagingException {
        try {
            Context context = new Context(Locale.FRENCH);
            if (variables != null) {
                variables.forEach(context::setVariable);
            }

            String htmlContent = templateEngine.process(templateName, context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    mimeMessage,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("HTML email [template={}] sent to: {}", templateName, to);
        } catch (MessagingException e) {
            log.error("Failed to build HTML email for template '{}' to '{}': {}", templateName, to, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Failed to send HTML email to '{}': {}", to, e.getMessage(), e);
            throw new EmailSendException(to, e.getMessage(), e);
        }
    }
}
