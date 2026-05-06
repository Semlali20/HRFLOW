package com.innovx.gestionrh.payload.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class JwtResponse {

    private final String accessToken;
    private final String refreshToken;
    @Builder.Default
    private final String tokenType = "Bearer";
    private final Long id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String title;
    private final List<String> roles;
    private final List<String> permissions;
    private final boolean mustChangePassword;
}
