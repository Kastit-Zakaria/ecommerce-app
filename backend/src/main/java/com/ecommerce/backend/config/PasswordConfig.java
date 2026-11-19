package com.ecommerce.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    // fPasswordEncoder : déclare l'outil de vérification des mots de passe
    // Reçoit : rien
    // Renvoie : un encodeur BCrypt (sel intégré, coût de calcul adaptatif)
    // Pourquoi : ne comparer que des empreintes BCrypt, jamais des mots de passe en clair
    @Bean
    public PasswordEncoder fPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
