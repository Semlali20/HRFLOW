package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.Notification;
import com.innovx.gestionrh.Entity.NotificationType;
import com.innovx.gestionrh.Entity.User;

import java.util.List;

public interface NotificationService {

    void sendDailyNotifications();

    Notification push(User user, String title, String message, NotificationType type);

    List<Notification> getUnread(String email);

    void markAllRead(String email);
}
