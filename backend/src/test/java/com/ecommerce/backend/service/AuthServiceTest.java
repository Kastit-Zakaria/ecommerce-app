package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository objUserRepository;

    private final BCryptPasswordEncoder objPasswordEncoder = new BCryptPasswordEncoder();

    private AuthService objAuthService;

    private User objUser;

    // fSetUp : prépare le service avec un vrai encodeur BCrypt et un membre de test
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier le vrai comportement de BCrypt, sans base de données
    @BeforeEach
    void fSetUp() {
        objAuthService = new AuthService(objUserRepository, objPasswordEncoder);

        objUser = new User();
        objUser.setId(1L);
        objUser.setFirstName("Camille");
        objUser.setLastName("Dupont");
        objUser.setEmail("camille@exemple.com");
        objUser.setPasswordHash(objPasswordEncoder.encode("MotDePasse-1"));
    }

    // fAuthenticate_renvoieLeMembreSiLesIdentifiantsSontCorrects : cas de succès (email nettoyé)
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider la connexion nominale
    @Test
    void fAuthenticate_renvoieLeMembreSiLesIdentifiantsSontCorrects() {
        when(objUserRepository.findByEmail("camille@exemple.com")).thenReturn(Optional.of(objUser));

        User objResult = objAuthService.fAuthenticate("  Camille@Exemple.com ", "MotDePasse-1");

        assertSame(objUser, objResult);
    }

    // fAuthenticate_refuseUnEmailVide : champ email vide
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : garantir une erreur 400 sans consulter la base
    @Test
    void fAuthenticate_refuseUnEmailVide() {
        ResponseStatusException objException = assertThrows(
                ResponseStatusException.class,
                () -> objAuthService.fAuthenticate("  ", "MotDePasse-1")
        );

        assertEquals(HttpStatus.BAD_REQUEST, objException.getStatusCode());
        verifyNoInteractions(objUserRepository);
    }

    // fAuthenticate_refuseUnMotDePasseVide : champ mot de passe vide ou absent
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : garantir une erreur 400 sans consulter la base
    @Test
    void fAuthenticate_refuseUnMotDePasseVide() {
        ResponseStatusException objException = assertThrows(
                ResponseStatusException.class,
                () -> objAuthService.fAuthenticate("camille@exemple.com", "")
        );
        ResponseStatusException objExceptionNull = assertThrows(
                ResponseStatusException.class,
                () -> objAuthService.fAuthenticate("camille@exemple.com", null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, objException.getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, objExceptionNull.getStatusCode());
        verifyNoInteractions(objUserRepository);
    }

    // fAuthenticate_refuseUnMauvaisMotDePasse : email connu, mot de passe faux
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : garantir un 401 avec le message générique
    @Test
    void fAuthenticate_refuseUnMauvaisMotDePasse() {
        when(objUserRepository.findByEmail("camille@exemple.com")).thenReturn(Optional.of(objUser));

        ResponseStatusException objException = assertThrows(
                ResponseStatusException.class,
                () -> objAuthService.fAuthenticate("camille@exemple.com", "autre-chose")
        );

        assertEquals(HttpStatus.UNAUTHORIZED, objException.getStatusCode());
        assertEquals("Email ou mot de passe incorrect", objException.getReason());
    }

    // fAuthenticate_refuseUnEmailInconnu : email absent de la base
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : garantir le même 401 et le même message que pour un mauvais mot de passe
    @Test
    void fAuthenticate_refuseUnEmailInconnu() {
        when(objUserRepository.findByEmail("inconnu@exemple.com")).thenReturn(Optional.empty());

        ResponseStatusException objException = assertThrows(
                ResponseStatusException.class,
                () -> objAuthService.fAuthenticate("inconnu@exemple.com", "MotDePasse-1")
        );

        assertEquals(HttpStatus.UNAUTHORIZED, objException.getStatusCode());
        assertEquals("Email ou mot de passe incorrect", objException.getReason());
    }
}
