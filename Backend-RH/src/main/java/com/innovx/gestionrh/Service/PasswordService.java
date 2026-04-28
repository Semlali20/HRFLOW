package com.innovx.gestionrh.Service;

import com.innovx.gestionrh.Entity.User;

public interface PasswordService {
     String generatePassword();
     void sendPasswordByEmail(String email, String password);
    void modifyPassword(User user, String oldPassword, String newPassword);
}
