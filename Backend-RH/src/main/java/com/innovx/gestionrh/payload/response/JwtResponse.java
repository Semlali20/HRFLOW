package com.innovx.gestionrh.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class JwtResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long id;
    private String lastname;
    private String firstname;
    private String email;
    private String title;
    private String userRole;
    private List<String> permissions;

    public JwtResponse(String accessToken, String refreshToken, Long id, String lastname,
                       String firstname, String email, String title, String userRole,
                       List<String> permissions) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.id = id;
        this.lastname = lastname;
        this.firstname = firstname;
        this.email = email;
        this.title = title;
        this.userRole = userRole;
        this.permissions = permissions;
    }
}
