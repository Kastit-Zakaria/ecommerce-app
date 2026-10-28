package com.ecommerce.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    // fCorsConfigurer : déclare les règles CORS de l'API
    // Reçoit : rien
    // Renvoie : un WebMvcConfigurer qui autorise le front (http://localhost:5173)
    // Pourquoi : permettre au navigateur d'appeler l'API depuis le serveur Vite
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
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}