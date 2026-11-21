package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
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
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Tests d'intégration de /api/auth (base H2 en mémoire, voir src/test/resources)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthIntegrationTest {

    @Autowired
    private MockMvc objMockMvc;

    @Autowired
    private UserRepository objUserRepository;

    @Autowired
    private PasswordEncoder objPasswordEncoder;

    // fSetUp : enregistre un membre de test avec un mot de passe hashé en BCrypt
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : disposer d'un compte pour les scénarios de connexion
    @BeforeEach
    void fSetUp() {
        User objUser = new User();
        objUser.setFirstName("Camille");
        objUser.setLastName("Dupont");
        objUser.setAddress("Rue de l'Exemple 12");
        objUser.setPostalCode("1000");
        objUser.setCity("Bruxelles");
        objUser.setEmail("camille@exemple.com");
        objUser.setPasswordHash(objPasswordEncoder.encode("MotDePasse-1"));
        objUserRepository.save(objUser);
    }

    // fPostLogin : envoie une demande de connexion
    // Reçoit : strBody (le JSON à envoyer)
    // Renvoie : l'action MockMvc prête à vérifier
    // Pourquoi : éviter de répéter la requête dans chaque test
    private ResultActions fPostLogin(String strBody) throws Exception {
        return objMockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(strBody));
    }

    // fLogin_connecteUnMembre : identifiants corrects
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier le 200, le contenu et l'absence de mot de passe / empreinte dans la réponse
    @Test
    void fLogin_connecteUnMembre() throws Exception {
        fPostLogin("{\"email\":\"camille@exemple.com\",\"password\":\"MotDePasse-1\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Camille"))
                .andExpect(jsonPath("$.lastName").value("Dupont"))
                .andExpect(jsonPath("$.email").value("camille@exemple.com"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(content().string(not(containsString("$2"))))
                .andExpect(content().string(not(containsString("MotDePasse-1"))));
    }

    // fLogin_refuseLesChampsVides : email ou mot de passe vide ou absent
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier le 400
    @Test
    void fLogin_refuseLesChampsVides() throws Exception {
        fPostLogin("{\"email\":\"\",\"password\":\"MotDePasse-1\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
        fPostLogin("{\"email\":\"camille@exemple.com\",\"password\":\"\"}")
                .andExpect(status().isBadRequest());
        fPostLogin("{}")
                .andExpect(status().isBadRequest());
    }

    // fLogin_refuseUnMauvaisMotDePasse : mot de passe faux
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier le 401 et le message générique
    @Test
    void fLogin_refuseUnMauvaisMotDePasse() throws Exception {
        fPostLogin("{\"email\":\"camille@exemple.com\",\"password\":\"faux\"}")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email ou mot de passe incorrect"));
    }

    // fLogin_refuseUnEmailInconnu : email absent de la base
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier que la réponse est identique à celle d'un mauvais mot de passe
    @Test
    void fLogin_refuseUnEmailInconnu() throws Exception {
        fPostLogin("{\"email\":\"inconnu@exemple.com\",\"password\":\"MotDePasse-1\"}")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email ou mot de passe incorrect"));
    }

    // fMe_renvoie401SansSession : aucune connexion
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier le 401
    @Test
    void fMe_renvoie401SansSession() throws Exception {
        objMockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    // fMe_renvoieLeMembreConnecte : après une connexion réussie, avec la session créée
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier que la session retrouve le membre
    @Test
    void fMe_renvoieLeMembreConnecte() throws Exception {
        MvcResult objLoginResult = fPostLogin("{\"email\":\"camille@exemple.com\",\"password\":\"MotDePasse-1\"}")
                .andExpect(status().isOk())
                .andReturn();
        MockHttpSession objSession = (MockHttpSession) objLoginResult.getRequest().getSession(false);

        objMockMvc.perform(get("/api/auth/me").session(objSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Camille"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    // fLogout_deconnecteUnMembre : déconnexion avec une session ouverte
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier le 204, puis que /me répond 401 avec la même session
    @Test
    void fLogout_deconnecteUnMembre() throws Exception {
        MvcResult objLoginResult = fPostLogin("{\"email\":\"camille@exemple.com\",\"password\":\"MotDePasse-1\"}")
                .andExpect(status().isOk())
                .andReturn();
        MockHttpSession objSession = (MockHttpSession) objLoginResult.getRequest().getSession(false);

        objMockMvc.perform(post("/api/auth/logout").session(objSession))
                .andExpect(status().isNoContent());

        objMockMvc.perform(get("/api/auth/me").session(objSession))
                .andExpect(status().isUnauthorized());
    }

    // fLogout_repond204SansSession : déconnexion sans aucune session
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier que l'appel n'est pas une erreur
    @Test
    void fLogout_repond204SansSession() throws Exception {
        objMockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent());
    }

    // fLogin_renouvelleLaSession : une session existante est remplacée à la connexion
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier la protection contre la fixation de session
    @Test
    void fLogin_renouvelleLaSession() throws Exception {
        MockHttpSession objOldSession = new MockHttpSession();
        String strOldId = objOldSession.getId();

        MvcResult objResult = objMockMvc.perform(post("/api/auth/login")
                        .session(objOldSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"camille@exemple.com\",\"password\":\"MotDePasse-1\"}"))
                .andExpect(status().isOk())
                .andReturn();

        org.junit.jupiter.api.Assertions.assertNotEquals(strOldId, objResult.getRequest().getSession(false).getId());
    }

    // Corps JSON valide pour l'inscription (email à compléter)
    private static final String STR_REGISTER_BODY = "{\"lastName\":\"Martin\",\"firstName\":\"Alex\","
            + "\"address\":\"Avenue Louise 5\",\"postalCode\":\"1050\",\"city\":\"Ixelles\","
            + "\"email\":\"%s\",\"password\":\"MotDePasse-2\"}";

    // fPostRegister : envoie une demande d'inscription
    // Reçoit : strBody (le JSON à envoyer)
    // Renvoie : l'action MockMvc prête à vérifier
    // Pourquoi : éviter de répéter la requête dans chaque test
    private ResultActions fPostRegister(String strBody) throws Exception {
        return objMockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(strBody));
    }

    // fRegister_creeLeCompteEtConnecteLeMembre : inscription valide
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier le 201, la réponse sans secret, l'enregistrement en base et l'ouverture de la session
    @Test
    void fRegister_creeLeCompteEtConnecteLeMembre() throws Exception {
        MvcResult objResult = fPostRegister(String.format(STR_REGISTER_BODY, "Alex@Exemple.com"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Alex"))
                .andExpect(jsonPath("$.lastName").value("Martin"))
                .andExpect(jsonPath("$.email").value("alex@exemple.com"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(content().string(not(containsString("$2"))))
                .andExpect(content().string(not(containsString("MotDePasse-2"))))
                .andReturn();

        User objSaved = objUserRepository.findByEmail("alex@exemple.com").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals("Ixelles", objSaved.getCity());
        org.junit.jupiter.api.Assertions.assertTrue(objPasswordEncoder.matches("MotDePasse-2", objSaved.getPasswordHash()));

        // La session ouverte par l'inscription permet d'être reconnu, comme après une connexion
        MockHttpSession objSession = (MockHttpSession) objResult.getRequest().getSession(false);
        objMockMvc.perform(get("/api/auth/me").session(objSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alex"));
    }

    // fRegister_permetEnsuiteDeSeConnecter : le compte créé fonctionne avec la connexion US4
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier que l'empreinte enregistrée est bien celle du mot de passe choisi
    @Test
    void fRegister_permetEnsuiteDeSeConnecter() throws Exception {
        fPostRegister(String.format(STR_REGISTER_BODY, "alex@exemple.com"))
                .andExpect(status().isCreated());

        fPostLogin("{\"email\":\"alex@exemple.com\",\"password\":\"MotDePasse-2\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alex"));
    }

    // fRegister_refuseUnEmailDejaUtilise : email du membre de test, avec une autre casse
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier le 409 et son message
    @Test
    void fRegister_refuseUnEmailDejaUtilise() throws Exception {
        fPostRegister(String.format(STR_REGISTER_BODY, "Camille@Exemple.com"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Un compte existe déjà avec cette adresse e-mail."));
    }

    // fRegister_refuseLesChampsVidesOuInvalides : champ manquant, email invalide, mot de passe trop court
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier les 400 et leurs messages
    @Test
    void fRegister_refuseLesChampsVidesOuInvalides() throws Exception {
        fPostRegister("{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Tous les champs sont obligatoires."));
        fPostRegister(String.format(STR_REGISTER_BODY, "pas-un-email"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("L'adresse e-mail n'est pas valide."));
        fPostRegister(String.format(STR_REGISTER_BODY, "alex@exemple.com").replace("MotDePasse-2", "court"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Le mot de passe doit contenir au moins 8 caractères."));
    }
}
