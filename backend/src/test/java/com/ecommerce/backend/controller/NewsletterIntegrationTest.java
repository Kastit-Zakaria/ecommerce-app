package com.ecommerce.backend.controller;

import com.ecommerce.backend.repository.NewsletterSubscriberRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Tests d'intégration de POST /api/newsletter (base H2 en mémoire, voir src/test/resources)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NewsletterIntegrationTest {

    @Autowired
    private MockMvc objMockMvc;

    @Autowired
    private NewsletterSubscriberRepository objNewsletterSubscriberRepository;

    // fPostNewsletter : envoie un corps JSON à la route
    // Reçoit : strBody, le JSON à envoyer
    // Renvoie : l'action MockMvc prête à vérifier
    // Pourquoi : éviter de répéter la requête dans chaque test
    private org.springframework.test.web.servlet.ResultActions fPostNewsletter(String strBody) throws Exception {
        return objMockMvc.perform(post("/api/newsletter")
                .contentType(MediaType.APPLICATION_JSON)
                .content(strBody));
    }

    // fPostNewsletter_inscritUnEmailValide : cas valide
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier 201 et l'enregistrement en base
    @Test
    void fPostNewsletter_inscritUnEmailValide() throws Exception {
        fPostNewsletter("{\"email\":\"marie@exemple.com\",\"consent\":true}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").exists());

        assertEquals(1, objNewsletterSubscriberRepository.count());
    }

    // fPostNewsletter_refuseUnEmailInvalide : e-mail mal formé
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier 400 avec un message
    @Test
    void fPostNewsletter_refuseUnEmailInvalide() throws Exception {
        fPostNewsletter("{\"email\":\"pas-un-email\",\"consent\":true}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("L'adresse e-mail n'est pas valide."));

        assertEquals(0, objNewsletterSubscriberRepository.count());
    }

    // fPostNewsletter_refuseSansConsentement : consentement absent ou faux
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier 400 (consentement obligatoire)
    @Test
    void fPostNewsletter_refuseSansConsentement() throws Exception {
        fPostNewsletter("{\"email\":\"marie@exemple.com\",\"consent\":false}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Le consentement est obligatoire pour s'inscrire."));

        fPostNewsletter("{\"email\":\"marie@exemple.com\"}")
                .andExpect(status().isBadRequest());

        assertEquals(0, objNewsletterSubscriberRepository.count());
    }

    // fPostNewsletter_refuseUnEmailDejaInscrit : doublon
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : vérifier 409 avec un message clair
    @Test
    void fPostNewsletter_refuseUnEmailDejaInscrit() throws Exception {
        fPostNewsletter("{\"email\":\"marie@exemple.com\",\"consent\":true}")
                .andExpect(status().isCreated());

        fPostNewsletter("{\"email\":\"MARIE@exemple.com\",\"consent\":true}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Cette adresse e-mail est déjà inscrite."));

        assertEquals(1, objNewsletterSubscriberRepository.count());
    }
}
