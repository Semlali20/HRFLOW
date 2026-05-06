package com.innovx.gestionrh.Config;

/**
 * Mail configuration is fully handled by Spring Boot autoconfiguration.
 *
 * All SMTP settings are read from application.properties via the spring.mail.*
 * prefix (host, port, username, password, and mail properties). Credentials are
 * resolved from environment variables SPRING_MAIL_USERNAME / SPRING_MAIL_PASSWORD
 * so they are never hardcoded in source.
 *
 * No manual JavaMailSender bean is needed here — Spring Boot creates it
 * automatically when spring-boot-starter-mail is on the classpath.
 */
public class MailConfig {
    // Intentionally empty — see application.properties for spring.mail.* configuration.
}
