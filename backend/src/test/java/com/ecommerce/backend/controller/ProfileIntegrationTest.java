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
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Base H2 réelle et sessions HTTP, sans modifier les données MySQL de l'équipe.
@SpringBootTest
@AutoConfigureMockMvc
class ProfileIntegrationTest {
    @Autowired MockMvc objMockMvc;
    @Autowired UserRepository objUserRepository;
    @Autowired PasswordEncoder objPasswordEncoder;
    private User objMember;
    private User objOther;
    private MockHttpSession objSession;
    private static final String STR_PROFILE = """
        {"firstName":" Camille ","lastName":"Martin","email":"camille@exemple.com",
         "address":"Rue Neuve 20","postalCode":"9000","city":"Gand"}
        """;
    private User fMember(String strEmail) {
        User objUser = new User();
        objUser.setFirstName("Camille"); objUser.setLastName("Dupont");
        objUser.setEmail(strEmail); objUser.setAddress("Rue Exemple 12");
        objUser.setPostalCode("1000"); objUser.setCity("Bruxelles");
        objUser.setPasswordHash(objPasswordEncoder.encode("MotDePasse-1"));
        return objUserRepository.saveAndFlush(objUser);
    }
    @BeforeEach void fPrepare() throws Exception {
        objUserRepository.deleteAll();
        objMember = fMember("camille@exemple.com");
        objOther = fMember("autre@exemple.com");
        objSession = (MockHttpSession) objMockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"camille@exemple.com\",\"password\":\"MotDePasse-1\"}"))
                .andExpect(status().isOk()).andReturn().getRequest().getSession(false);
    }
    @Test void fReadAndPersist() throws Exception {
        objMockMvc.perform(get("/api/auth/me").session(objSession))
                .andExpect(status().isOk()).andExpect(jsonPath("$.address").value("Rue Exemple 12"))
                .andExpect(jsonPath("$.role").doesNotExist()).andExpect(jsonPath("$.passwordHash").doesNotExist());
        objMockMvc.perform(put("/api/auth/me").session(objSession)
                .header("Origin", "http://localhost:5173").contentType(MediaType.APPLICATION_JSON).content(STR_PROFILE))
                .andExpect(status().isOk()).andExpect(jsonPath("$.firstName").value("Camille"));
        objMockMvc.perform(get("/api/auth/me").session(objSession))
                .andExpect(jsonPath("$.city").value("Gand"));
        assertEquals("Gand", objUserRepository.findById(objMember.getId()).orElseThrow().getCity());
    }
    @Test void fEmailChangeKeepsSessionAndNewLogin() throws Exception {
        objMockMvc.perform(put("/api/auth/me").session(objSession).contentType(MediaType.APPLICATION_JSON)
                .content(STR_PROFILE.replace("camille@exemple.com", "nouveau@exemple.com"))).andExpect(status().isOk());
        objMockMvc.perform(get("/api/auth/me").session(objSession)).andExpect(jsonPath("$.email").value("nouveau@exemple.com"));
        objMockMvc.perform(post("/api/auth/logout").session(objSession)).andExpect(status().isNoContent());
        objMockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nouveau@exemple.com\",\"password\":\"MotDePasse-1\"}")).andExpect(status().isOk());
        objMockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"camille@exemple.com\",\"password\":\"MotDePasse-1\"}")).andExpect(status().isUnauthorized());
    }
    @Test void fDuplicateAndInvalidLeaveDataUntouched() throws Exception {
        objMockMvc.perform(put("/api/auth/me").session(objSession).contentType(MediaType.APPLICATION_JSON)
                .content(STR_PROFILE.replace("camille@exemple.com", "autre@exemple.com"))).andExpect(status().isConflict());
        for (String strBody : new String[]{STR_PROFILE.replace("camille@exemple.com", "invalide"),
                STR_PROFILE.replace(" Camille ", " "), STR_PROFILE.replace("Gand", "x".repeat(101)), "{}"}) {
            objMockMvc.perform(put("/api/auth/me").session(objSession).contentType(MediaType.APPLICATION_JSON)
                    .content(strBody)).andExpect(status().isBadRequest());
        }
        assertEquals("Dupont", objUserRepository.findById(objMember.getId()).orElseThrow().getLastName());
    }
    @Test void fNoSessionAndExpiredSessionRejected() throws Exception {
        objMockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        objMockMvc.perform(put("/api/auth/me").contentType(MediaType.APPLICATION_JSON).content(STR_PROFILE)).andExpect(status().isUnauthorized());
        objUserRepository.deleteById(objMember.getId());
        objMockMvc.perform(put("/api/auth/me").session(objSession).contentType(MediaType.APPLICATION_JSON).content(STR_PROFILE)).andExpect(status().isUnauthorized());
    }
    @Test void fProtectedPropertiesCannotTargetOtherAccount() throws Exception {
        String strHash = objMember.getPasswordHash();
        String strBody = STR_PROFILE.trim();
        strBody = strBody.substring(0, strBody.length()-1) + ",\"id\":" + objOther.getId()
                + ",\"role\":\"ROLE_ADMIN\",\"passwordHash\":\"pirate\",\"password\":\"pirate\"}";
        // Selon la configuration JSON, les propriétés inconnues sont ignorées ou refusées.
        int intStatus = objMockMvc.perform(put("/api/auth/me").session(objSession).contentType(MediaType.APPLICATION_JSON)
                .content(strBody)).andReturn().getResponse().getStatus();
        assertTrue(intStatus == 200 || intStatus == 400);
        User objFresh = objUserRepository.findById(objMember.getId()).orElseThrow();
        assertEquals("ROLE_USER", objFresh.getRole()); assertEquals(strHash, objFresh.getPasswordHash());
        assertEquals("Dupont", objUserRepository.findById(objOther.getId()).orElseThrow().getLastName());
    }
    @Test void fCrossOriginWriteRejected() throws Exception {
        objMockMvc.perform(put("/api/auth/me").session(objSession).header("Origin", "https://autre.invalid")
                .contentType(MediaType.APPLICATION_JSON).content(STR_PROFILE)).andExpect(status().isForbidden());
    }
                           }
