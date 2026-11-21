package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
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
        objUser.setAddress("Rue de l'Exemple 12");
        objUser.setPostalCode("1000");
        objUser.setCity("Bruxelles");
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

    // fRegisterValid : appelle l'inscription avec des valeurs valides, sauf celles passées en paramètre
    // Reçoit : strEmail (l'email à utiliser), strPassword (le mot de passe à utiliser)
    // Renvoie : le membre créé
    // Pourquoi : éviter de répéter les sept champs dans chaque test
    private User fRegisterValid(String strEmail, String strPassword) {
        return objAuthService.fRegister("Martin", "Alex", "Avenue Louise 5", "1050", "Ixelles", strEmail, strPassword);
    }

    // fAssertRegisterRefused : vérifie qu'une inscription est refusée sans rien enregistrer
    // Reçoit : objStatus (le code attendu), strReason (le message attendu), objCall (l'appel à tester)
    // Renvoie : rien
    // Pourquoi : factoriser la vérification commune aux cas d'erreur
    private void fAssertRegisterRefused(HttpStatus objStatus, String strReason, org.junit.jupiter.api.function.Executable objCall) {
        ResponseStatusException objException = assertThrows(ResponseStatusException.class, objCall);
        assertEquals(objStatus, objException.getStatusCode());
        assertEquals(strReason, objException.getReason());
        verify(objUserRepository, never()).saveAndFlush(any());
    }

    // fRegister_creeLeCompteAvecUneEmpreinteBCrypt : cas nominal (champs nettoyés, email en minuscules)
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier l'enregistrement et que le mot de passe n'est jamais stocké en clair
    @Test
    void fRegister_creeLeCompteAvecUneEmpreinteBCrypt() {
        when(objUserRepository.findByEmail("alex@exemple.com")).thenReturn(Optional.empty());
        when(objUserRepository.saveAndFlush(any(User.class))).thenAnswer((objInvocation) -> objInvocation.getArgument(0));

        User objResult = objAuthService.fRegister(" Martin ", " Alex ", " Avenue Louise 5 ", " 1050 ", " Ixelles ",
                "  Alex@Exemple.com ", "MotDePasse-2");

        assertEquals("Martin", objResult.getLastName());
        assertEquals("Alex", objResult.getFirstName());
        assertEquals("Avenue Louise 5", objResult.getAddress());
        assertEquals("1050", objResult.getPostalCode());
        assertEquals("Ixelles", objResult.getCity());
        assertEquals("alex@exemple.com", objResult.getEmail());
        assertEquals("ROLE_USER", objResult.getRole());
        assertNotEquals("MotDePasse-2", objResult.getPasswordHash());
        assertTrue(objPasswordEncoder.matches("MotDePasse-2", objResult.getPasswordHash()));
    }

    // fRegister_refuseUnChampVide : chacun des sept champs, vide, blanc ou absent
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : tous les champs sont obligatoires, sans consulter la base
    @Test
    void fRegister_refuseUnChampVide() {
        String strMessage = AuthService.STR_REQUIRED_FIELDS;
        HttpStatus objStatus = HttpStatus.BAD_REQUEST;

        fAssertRegisterRefused(objStatus, strMessage, () -> objAuthService.fRegister("", "Alex", "Avenue Louise 5", "1050", "Ixelles", "a@exemple.com", "MotDePasse-2"));
        fAssertRegisterRefused(objStatus, strMessage, () -> objAuthService.fRegister("Martin", "  ", "Avenue Louise 5", "1050", "Ixelles", "a@exemple.com", "MotDePasse-2"));
        fAssertRegisterRefused(objStatus, strMessage, () -> objAuthService.fRegister("Martin", "Alex", null, "1050", "Ixelles", "a@exemple.com", "MotDePasse-2"));
        fAssertRegisterRefused(objStatus, strMessage, () -> objAuthService.fRegister("Martin", "Alex", "Avenue Louise 5", "", "Ixelles", "a@exemple.com", "MotDePasse-2"));
        fAssertRegisterRefused(objStatus, strMessage, () -> objAuthService.fRegister("Martin", "Alex", "Avenue Louise 5", "1050", " ", "a@exemple.com", "MotDePasse-2"));
        fAssertRegisterRefused(objStatus, strMessage, () -> objAuthService.fRegister("Martin", "Alex", "Avenue Louise 5", "1050", "Ixelles", "", "MotDePasse-2"));
        fAssertRegisterRefused(objStatus, strMessage, () -> objAuthService.fRegister("Martin", "Alex", "Avenue Louise 5", "1050", "Ixelles", "a@exemple.com", ""));
        verifyNoInteractions(objUserRepository);
    }

    // fRegister_refuseUnEmailInvalide : adresse sans arobase ou sans domaine
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : garantir un login exploitable
    @Test
    void fRegister_refuseUnEmailInvalide() {
        fAssertRegisterRefused(HttpStatus.BAD_REQUEST, "L'adresse e-mail n'est pas valide.", () -> fRegisterValid("alex.exemple.com", "MotDePasse-2"));
        fAssertRegisterRefused(HttpStatus.BAD_REQUEST, "L'adresse e-mail n'est pas valide.", () -> fRegisterValid("alex@exemple", "MotDePasse-2"));
    }

    // fRegister_refuseUnMotDePasseTropCourtOuTropLong : moins de 8 caractères, ou plus de 72 octets
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : imposer un minimum de robustesse et éviter la troncature silencieuse de BCrypt
    @Test
    void fRegister_refuseUnMotDePasseTropCourtOuTropLong() {
        fAssertRegisterRefused(HttpStatus.BAD_REQUEST, "Le mot de passe doit contenir au moins 8 caractères.", () -> fRegisterValid("alex@exemple.com", "Court-1"));
        fAssertRegisterRefused(HttpStatus.BAD_REQUEST, "Le mot de passe est trop long.", () -> fRegisterValid("alex@exemple.com", "a".repeat(73)));
    }

    // fRegister_refuseUnChampTropLong : valeur plus longue que sa colonne
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : renvoyer un message clair au lieu d'une erreur SQL
    @Test
    void fRegister_refuseUnChampTropLong() {
        fAssertRegisterRefused(HttpStatus.BAD_REQUEST, "Le code postal ne doit pas dépasser 10 caractères.",
                () -> objAuthService.fRegister("Martin", "Alex", "Avenue Louise 5", "12345678901", "Ixelles", "alex@exemple.com", "MotDePasse-2"));
    }

    // fRegister_refuseUnEmailDejaUtilise : un compte existe déjà avec cet email (même avec une autre casse)
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : deux membres ne peuvent pas avoir le même courriel
    @Test
    void fRegister_refuseUnEmailDejaUtilise() {
        when(objUserRepository.findByEmail("camille@exemple.com")).thenReturn(Optional.of(objUser));

        fAssertRegisterRefused(HttpStatus.CONFLICT, AuthService.STR_EMAIL_ALREADY_USED, () -> fRegisterValid("Camille@Exemple.com", "MotDePasse-2"));
    }

    // fRegister_refuseUnDoublonDetecteParLaBase : deux inscriptions simultanées, l'index unique refuse la seconde
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : garantir un 409 et non une erreur 500 dans ce cas rare
    @Test
    void fRegister_refuseUnDoublonDetecteParLaBase() {
        when(objUserRepository.findByEmail("alex@exemple.com")).thenReturn(Optional.empty());
        when(objUserRepository.saveAndFlush(any(User.class))).thenThrow(new DataIntegrityViolationException("uk_email"));

        ResponseStatusException objException = assertThrows(ResponseStatusException.class, () -> fRegisterValid("alex@exemple.com", "MotDePasse-2"));

        assertEquals(HttpStatus.CONFLICT, objException.getStatusCode());
        assertEquals(AuthService.STR_EMAIL_ALREADY_USED, objException.getReason());
    }
}
