    package com.innovx.gestionrh.Config;

    import java.util.Objects;
    import java.util.Properties;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.core.env.Environment;
    import org.springframework.mail.javamail.JavaMailSender;
    import org.springframework.mail.javamail.JavaMailSenderImpl;

    @Configuration
    public class MailConfig {

        @Autowired
        private Environment environment;

        @Bean
        public JavaMailSender javaMailSender() {
            JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
            mailSender.setHost("smtp.gmail.com");
            mailSender.setPort(587);
            mailSender.setUsername("hrcom.innovx@gmail.com");
            mailSender.setPassword("cqdo yojq qgce jbtg"); // Use an environment variable or secure storage for the password

            Properties props = mailSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");

            return mailSender;
        }
    }
