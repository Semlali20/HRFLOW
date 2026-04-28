package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordServiceImpl implements PasswordService{
    @Autowired
    private JavaMailSender emailSender;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Override
    public String generatePassword() {
        String password = UUID.randomUUID().toString().substring(0, 8);
        return password;
    }

    @Override
    public void sendPasswordByEmail(String email, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your New Password");
        message.setText("Your new password is: " + password);
        emailSender.send(message);
    }

    @Override
    public void modifyPassword(User user, String oldPassword, String newPassword) {
        if (passwordEncoder.matches(oldPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setLastPasswordChange(LocalDateTime.now());
            // Save User to the database
            userRepository.save(user);
        } else {
            throw new IllegalArgumentException("Old password does not match.");
        }
    }
}

