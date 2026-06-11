package com.innovx.gestionrh.Config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8090}")
    private String serverPort;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("InnovX GestionRH API")
                .description("Enterprise HR Management System REST API")
                .version("1.0.0")
                .contact(new Contact()
                    .name("InnovX Team")
                    .email("support@innovx.com"))
                .license(new License().name("Private").url("https://innovx.com")))
            .servers(List.of(
                new Server().url("http://localhost:" + serverPort).description("Development"),
                new Server().url("https://api.innovx.com").description("Production")))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT token obtained from POST /api/v1/auth/login")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
