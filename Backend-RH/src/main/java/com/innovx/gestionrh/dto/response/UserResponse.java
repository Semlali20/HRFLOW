package com.innovx.gestionrh.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserResponse {
    private Long id;
    private Long version;
    private String firstName;
    private String lastName;
    private String email;
    private String title;
    private boolean mustChangePassword;
    private List<String> roles;
    private List<String> permissions;
    private LocalDateTime lastPasswordChange;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
