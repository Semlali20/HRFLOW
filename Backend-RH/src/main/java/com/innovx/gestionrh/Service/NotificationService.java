package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Collaborateurs;
import com.innovx.gestionrh.Entity.Notification;
import com.innovx.gestionrh.Entity.NotificationType;
import com.innovx.gestionrh.Entity.Stagiaires;
import com.innovx.gestionrh.Entity.User;
import com.innovx.gestionrh.Repository.CollaborateursRepository;
import com.innovx.gestionrh.Repository.NotificationRepository;
import com.innovx.gestionrh.Repository.StagiairesRepository;
import com.innovx.gestionrh.Repository.UserRepository;
import com.innovx.gestionrh.notification.SseEmitterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final CollaborateursRepository collaborateurRepository;
    private final StagiairesRepository stagiaireRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;
    private final SseEmitterRegistry sseEmitterRegistry;

    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("dd-MMM-yyyy")
    );

    @Scheduled(cron = "0 0 8 * * ?")
    public void sendDailyNotifications() {
        log.info("Starting daily notifications");

        LocalDate today = LocalDate.now();
        List<User> adminUsers = userRepository.findByRoleName("ADMIN");
        List<User> collaborateurRhUsers = userRepository.findByRoleName("COLLABORATEUR_RH");
        List<User> stagiaireRhUsers = userRepository.findByRoleName("STAGIAIRE_RH");

        Set<User> birthdayRecipients = new HashSet<>(adminUsers);
        birthdayRecipients.addAll(collaborateurRhUsers);

        Set<User> meetingRecipients = new HashSet<>(adminUsers);
        meetingRecipients.addAll(stagiaireRhUsers);

        collaborateurRepository.findAll().forEach(collaborateur -> {
            LocalDate birthDate = parseDate(collaborateur.getDate_naissance());
            if (birthDate != null
                    && birthDate.getDayOfMonth() == today.getDayOfMonth()
                    && birthDate.getMonth() == today.getMonth()) {
                sendBirthdayEmailToCollaborateur(collaborateur);
                String msg = "Anniversaire de " + collaborateur.getNom() + " " + collaborateur.getPrenom();
                birthdayRecipients.forEach(user -> push(user, "Anniversaire", msg, NotificationType.BIRTHDAY));
            }
        });

        stagiaireRepository.findAll().forEach(stagiaire -> {
            if (isMeetingToday(stagiaire, today)) {
                String msg = "Réunion avec " + stagiaire.getNom() + " " + stagiaire.getPrenom() + " aujourd'hui";
                meetingRecipients.forEach(user -> push(user, "Rappel Réunion", msg, NotificationType.MEETING));
            }
        });

        log.info("Daily notifications completed");
    }

    public Notification push(User user, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .recipientEmail(user.getEmail())
                .title(title)
                .message(message)
                .type(type)
                .build();
        notification = notificationRepository.save(notification);
        sseEmitterRegistry.send(user.getEmail(), notification);
        return notification;
    }

    public List<Notification> getUnread(String email) {
        return notificationRepository.findByRecipientEmailAndIsReadFalseOrderByCreatedAtDesc(email);
    }

    public void markAllRead(String email) {
        List<Notification> unread = notificationRepository.findByRecipientEmailAndIsReadFalseOrderByCreatedAtDesc(email);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        for (DateTimeFormatter fmt : DATE_FORMATS) {
            try {
                return LocalDate.parse(dateStr, fmt);
            } catch (DateTimeParseException ignored) {}
        }
        return null;
    }

    private boolean isMeetingToday(Stagiaires s, LocalDate today) {
        return isDateToday(String.valueOf(s.getAccueilRhDate()), today)
                || isDateToday(String.valueOf(s.getPointStagiaires7DaysDate()), today)
                || isDateToday(String.valueOf(s.getPointStagiaires1MonthDate()), today)
                || isDateToday(String.valueOf(s.getPointStagiaires3MonthsDate()), today);
    }

    private boolean isDateToday(String dateStr, LocalDate today) {
        LocalDate d = parseDate(dateStr);
        return d != null && d.equals(today);
    }

    private void sendBirthdayEmailToCollaborateur(Collaborateurs collaborateur) {
        String msg = "Joyeux anniversaire " + collaborateur.getNom() + " " + collaborateur.getPrenom()
                + " ! Toute l'équipe INNOVX vous souhaite une excellente journée.";
        emailService.sendEmail(collaborateur.getEmail(), "Joyeux Anniversaire", msg);
    }
}
