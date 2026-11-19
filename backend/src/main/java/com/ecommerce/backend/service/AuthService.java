package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    // Message unique pour tout échec : on ne dit jamais si c'est l'email ou le mot de passe qui est faux
    public static final String STR_INVALID_CREDENTIALS = "Email ou mot de passe incorrect";

    private final UserRepository objUserRepository;
    private final PasswordEncoder objPasswordEncoder;

    // Empreinte BCrypt factice : sert à faire le même calcul quand l'email est inconnu (temps de réponse similaire)
    private final String strDummyHash;

    // AuthService : constructeur (nom imposé par Java), Spring injecte les dépendances
    // Reçoit : objUserRepository, objPasswordEncoder
    // Renvoie : rien
    // Pourquoi : donner au service accès aux membres et à la vérification BCrypt
    public AuthService(UserRepository objUserRepository, PasswordEncoder objPasswordEncoder) {
        this.objUserRepository = objUserRepository;
        this.objPasswordEncoder = objPasswordEncoder;
        this.strDummyHash = objPasswordEncoder.encode("empreinte-factice");
    }

    // fAuthenticate : vérifie un email et un mot de passe
    // Reçoit : strEmail (le login), strPassword (le mot de passe saisi, jamais journalisé)
    // Renvoie : le membre authentifié ; erreur 400 si un champ est vide, 401 si les identifiants sont incorrects
    // Pourquoi : centraliser la règle de connexion avec un message d'échec générique
    public User fAuthenticate(String strEmail, String strPassword) {
        if (strEmail == null || strEmail.isBlank() || strPassword == null || strPassword.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'email et le mot de passe sont obligatoires.");
        }

        String strCleanEmail = strEmail.trim().toLowerCase();
        User objUser = objUserRepository.findByEmail(strCleanEmail).orElse(null);

        if (objUser == null) {
            objPasswordEncoder.matches(strPassword, strDummyHash);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, STR_INVALID_CREDENTIALS);
        }

        if (!objPasswordEncoder.matches(strPassword, objUser.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, STR_INVALID_CREDENTIALS);
        }

        return objUser;
    }

    // fFindById : retrouve un membre à partir de son identifiant de session
    // Reçoit : lngId, l'identifiant stocké dans la session
    // Renvoie : le membre, ou null s'il n'existe plus
    // Pourquoi : permettre à /api/auth/me de restituer l'utilisateur connecté
    public User fFindById(Long lngId) {
        return objUserRepository.findById(lngId).orElse(null);
    }
}
