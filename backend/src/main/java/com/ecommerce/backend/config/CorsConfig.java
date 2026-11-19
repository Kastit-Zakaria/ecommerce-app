package com.ecommerce.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    // Origine du front autorisée (propriété app.cors.allowed-origin, variable CORS_ALLOWED_ORIGIN)
    @Value("${app.cors.allowed-origin}")
    private String strAllowedOrigin;

    // fCorsConfigurer : déclare les règles CORS de l'API
    // Reçoit : rien
    // Renvoie : un WebMvcConfigurer qui autorise le front (origine configurée)
    // Pourquoi : permettre au navigateur d'appeler l'API depuis l'adresse du front, définie par configuration
    @Bean
    public WebMvcConfigurer fCorsConfigurer() {
        return new WebMvcConfigurer() {
            // addCorsMappings : méthode imposée par Spring (nom non modifiable)
            // Reçoit : objRegistry, le registre des règles CORS
            // Renvoie : rien
            // Pourquoi : appliquer les origines, méthodes et en-têtes autorisés
            @Override
            public void addCorsMappings(CorsRegistry objRegistry) {
                objRegistry.addMapping("/**")
                        .allowedOrigins(strAllowedOrigin)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        // Nécessaire pour que le navigateur envoie et reçoive le cookie de session
                        .allowCredentials(true);
            }
        };
    }
}