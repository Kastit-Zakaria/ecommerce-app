package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Base H2 réelle et sessions HTTP, sans modifier les données MySQL de l'équipe.
@SpringBootTest
@AutoConfigureMockMvc
class PasswordChangeIntegrationTest {

    private static final String STR_EMAIL = "camille@exemple.com";
    private static final String STR_OLD_PASSWORD = "MotDePasse-1";
    private static final String STR_NEW_PASSWORD = "MotDePasse-2";
    private static final String STR_URL = "/api/auth/me/password";

    @Autowired
    private MockMvc objMockMvc;

    @Autowired
    private UserRepository objUserRepository;

    @Autowired
    private PasswordEncoder objPasswordEncoder;

    private User objMember;
    private MockHttpSession objSession;

    // fPrepare : crée un membre et ouvre sa session
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : chaque test part d'un membre connecté avec l'ancien mot de passe
    @BeforeEach
    void fPrepare() throws Exception {
        objUserRepository.deleteAll();
        User objUser = new User();
        objUser.setFirstName("Camille");
        objUser.setLastName("Dupont");
        objUser.setAddress("Rue Exemple 12");
        objUser.setPostalCode("1000");
        objUser.setCity("Bruxelles");
        objUser.setEmail(STR_EMAIL);
        objUser.setPasswordHash(objPasswordEncoder.encode(STR_OLD_PASSWORD));
        objMember = objUserRepository.saveAndFlush(objUser);

        objSession = (MockHttpSession) fLogin(STR_OLD_PASSWORD)
                .andExpect(status().isOk())
                .andReturn().getRequest().getSession(false);
    }

    // fLogin : tente une connexion du membre de test
    // Reçoit : strPassword, le mot de passe à essayer
    // Renvoie : le résultat de la requête, à vérifier
    // Pourquoi : prouver quel mot de passe est accepté
    private ResultActions fLogin(String strPassword) throws Exception {
        return objMockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + STR_EMAIL + "\",\"password\":\"" + strPassword + "\"}"));
    }

    // fBody : construit le corps JSON du changement de mot de passe
    // Reçoit : strCurrent, strNew, strConfirmation (les trois saisies)
    // Renvoie : le texte JSON
    // Pourquoi : éviter de répéter le JSON dans chaque test
    private String fBody(String strCurrent, String strNew, String strConfirmation) {
        return "{\"currentPassword\":\"" + strCurrent + "\",\"newPassword\":\"" + strNew
                + "\",\"confirmation\":\"" + strConfirmation + "\"}";
    }

    // fAssertRefused : vérifie un refus 400 avec son message, sans changement en base ni déconnexion
    // Reçoit : strBody (le corps envoyé), strMessage (le message attendu)
    // Renvoie : rien
    // Pourquoi : factoriser la vérification commune aux saisies refusées
    private void fAssertRefused(String strBody, String strMessage) throws Exception {
        objMockMvc.perform(put(STR_URL).session(objSession)
                        .contentType(MediaType.APPLICATION_JSON).content(strBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(strMessage))
                .andExpect(jsonPath("$.currentPassword").doesNotExist())
                .andExpect(jsonPath("$.newPassword").doesNotExist());

        fAssertPasswordUnchanged();
        assertFalse(objSession.isInvalid());
        objMockMvc.perform(get("/api/auth/me").session(objSession)).andExpect(status().isOk());
    }

    // fAssertPasswordUnchanged : vérifie que l'empreinte en base n'a pas bougé
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : un refus ne doit jamais modifier le compte
    private void fAssertPasswordUnchanged() {
        User objFresh = objUserRepository.findById(objMember.getId()).orElseThrow();
        assertEquals(objMember.getPasswordHash(), objFresh.getPasswordHash());
    }

    // fSuccesRenouvelleLaSessionEtRemplaceLeMotDePasse : parcours nominal complet
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : 204 sans contenu, nouvelle session connectée, nouveau mot de passe seul accepté
    @Test
    void fSuccesRenouvelleLaSessionEtRemplaceLeMotDePasse() throws Exception {
        String strOldSessionId = objSession.getId();

        MvcResult objResult = objMockMvc.perform(put(STR_URL).session(objSession)
                        .header("Origin", "http://localhost:5173")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(fBody(STR_OLD_PASSWORD, STR_NEW_PASSWORD, STR_NEW_PASSWORD)))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""))
                .andReturn();

        MockHttpSession objNewSession = (MockHttpSession) objResult.getRequest().getSession(false);
        assertNotNull(objNewSession);
        assertNotEquals(strOldSessionId, objNewSession.getId());
        assertTrue(objSession.isInvalid());
        objMockMvc.perform(get("/api/auth/me").session(objNewSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(STR_EMAIL));

        User objFresh = objUserRepository.findById(objMember.getId()).orElseThrow();
        assertTrue(objFresh.getPasswordHash().startsWith("$2"));
        assertTrue(objPasswordEncoder.matches(STR_NEW_PASSWORD, objFresh.getPasswordHash()));

        fLogin(STR_NEW_PASSWORD).andExpect(status().isOk());
        fLogin(STR_OLD_PASSWORD).andExpect(status().isUnauthorized());
    }

    // fMotDePasseActuelFaux : refus avec le message dédié
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : 400 (et non 401) pour que le membre reste connecté
    @Test
    void fMotDePasseActuelFaux() throws Exception {
        fAssertRefused(fBody("Faux-mot-de-passe", STR_NEW_PASSWORD, STR_NEW_PASSWORD),
                AuthService.STR_CURRENT_PASSWORD_INCORRECT);
    }

    // fConfirmationDifferente : les deux saisies du nouveau mot de passe diffèrent
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : rien ne doit être enregistré
    @Test
    void fConfirmationDifferente() throws Exception {
        fAssertRefused(fBody(STR_OLD_PASSWORD, STR_NEW_PASSWORD, "MotDePasse-3"),
                AuthService.STR_PASSWORD_CONFIRMATION_MISMATCH);
    }

    // fNouveauTropCourtOuTropLong : mêmes messages qu'à l'inscription
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : les règles de l'inscription s'appliquent aussi au changement
    @Test
    void fNouveauTropCourtOuTropLong() throws Exception {
        fAssertRefused(fBody(STR_OLD_PASSWORD, "Court-1", "Court-1"),
                "Le mot de passe doit contenir au moins 8 caractères.");
        fAssertRefused(fBody(STR_OLD_PASSWORD, "a".repeat(73), "a".repeat(73)),
                "Le mot de passe est trop long.");
    }

    // fNouveauIdentique : le nouveau mot de passe est l'actuel
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : un changement doit réellement changer le mot de passe
    @Test
    void fNouveauIdentique() throws Exception {
        fAssertRefused(fBody(STR_OLD_PASSWORD, STR_OLD_PASSWORD, STR_OLD_PASSWORD),
                AuthService.STR_PASSWORD_UNCHANGED);
    }

    // fChampVideOuAbsent : un champ vide, ou un corps sans aucun champ
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : les trois champs sont obligatoires
    @Test
    void fChampVideOuAbsent() throws Exception {
        fAssertRefused(fBody("", STR_NEW_PASSWORD, STR_NEW_PASSWORD), AuthService.STR_REQUIRED_FIELDS);
        fAssertRefused(fBody(STR_OLD_PASSWORD, "", STR_NEW_PASSWORD), AuthService.STR_REQUIRED_FIELDS);
        fAssertRefused(fBody(STR_OLD_PASSWORD, STR_NEW_PASSWORD, ""), AuthService.STR_REQUIRED_FIELDS);
        fAssertRefused("{}", AuthService.STR_REQUIRED_FIELDS);
    }

    // fNonConnecte : requête sans session, puis session d'un compte supprimé
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : la route est réservée au membre connecté
    @Test
    void fNonConnecte() throws Exception {
        String strBody = fBody(STR_OLD_PASSWORD, STR_NEW_PASSWORD, STR_NEW_PASSWORD);

        objMockMvc.perform(put(STR_URL).contentType(MediaType.APPLICATION_JSON).content(strBody))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Non connecté."));
        objMockMvc.perform(put(STR_URL).session(new MockHttpSession())
                        .contentType(MediaType.APPLICATION_JSON).content(strBody))
                .andExpect(status().isUnauthorized());
        fAssertPasswordUnchanged();

        objUserRepository.deleteById(objMember.getId());
        objMockMvc.perform(put(STR_URL).session(objSession)
                        .contentType(MediaType.APPLICATION_JSON).content(strBody))
                .andExpect(status().isUnauthorized());
    }

    // fOrigineRefusee : requête valide envoyée depuis un autre site
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : même protection de l'en-tête Origin que la modification du profil
    @Test
    void fOrigineRefusee() throws Exception {
        objMockMvc.perform(put(STR_URL).session(objSession)
                        .header("Origin", "https://autre.invalid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(fBody(STR_OLD_PASSWORD, STR_NEW_PASSWORD, STR_NEW_PASSWORD)))
                .andExpect(status().isForbidden());

        fAssertPasswordUnchanged();
        assertFalse(objSession.isInvalid());
    }

    // fToStringMasqueLesMotsDePasse : représentation texte du corps de la requête
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : aucun mot de passe ne doit pouvoir se retrouver dans un log
    @Test
    void fToStringMasqueLesMotsDePasse() {
        String strText = new AuthController.PasswordRequest("secret-actuel", "secret-nouveau", "secret-confirme")
                .toString();

        assertFalse(strText.contains("secret"));
    }
}
