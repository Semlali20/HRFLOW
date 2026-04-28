package com.innovx.gestionrh.Service;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String message) {
        try {
            SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
            
            simpleMailMessage.setFrom("houarimehdi7@gmail.com"); // Set the sender email address
            simpleMailMessage.setTo(to);
            simpleMailMessage.setSubject(subject);
            simpleMailMessage.setText(message);


            mailSender.send(simpleMailMessage);
            System.out.println("Email sent successfully to: " + to);
        } catch (MailException e) {
            System.out.println("Failed to send email to: " + to);
            e.printStackTrace(); // Log the exception
            throw e; // Rethrow the exception to be handled by the caller
        }
    }
}
