package com.innovx.gestionrh.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenRefreshResponse {
    private final String accessToken;
    private final String refreshToken;
    private final String tokenType = "Bearer";
}
