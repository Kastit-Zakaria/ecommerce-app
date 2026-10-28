package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.NewsletterSubscriber;
import com.ecommerce.backend.repository.NewsletterSubscriberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NewsletterServiceTest {

    @Mock
    private NewsletterSubscriberRepository objNewsletterSubscriberRepository;

    @InjectMocks
    private NewsletterService objNewsletterService;

    // fSubscribe_enregistreUnInscritValide : cas valide, e-mail nettoyé et date de consentement posée
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : valider l'inscription nominale
    @Test
    void fSubscribe_enregistreUnInscritValide() {
        when(objNewsletterSubscriberRepository.existsByEmail("marie@exemple.com")).thenReturn(false);
        when(objNewsletterSubscriberRepository.save(any(NewsletterSubscriber.class)))
                .thenAnswer((objInvocation) -> objInvocation.getArgument(0));

        NewsletterSubscriber objResult = objNewsletterService.fSubscribe("  Marie@Exemple.com ", true);

        assertEquals("marie@exemple.com", objResult.getEmail());
        assertNotNull(objResult.getConsentDate());
    }

    // fSubscribe_refuseUnEmailInvalide : e-mail mal formé
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : garantir une erreur 400 et aucun enregistrement
    @Test
    void fSubscribe_refuseUnEmailInvalide() {
        ResponseStatusException objException = assertThrows(
                ResponseStatusException.class,
                () -> objNewsletterService.fSubscribe("pas-un-email", true)
        );

        assertEquals(HttpStatus.BAD_REQUEST, objException.getStatusCode());
        verify(objNewsletterSubscriberRepository, never()).save(any());
    }

    // fSubscribe_refuseSansConsentement : consentement absent ou faux
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : le consentement est obligatoire (RGPD)
    @Test
    void fSubscribe_refuseSansConsentement() {
        ResponseStatusException objExceptionFalse = assertThrows(
                ResponseStatusException.class,
                () -> objNewsletterService.fSubscribe("marie@exemple.com", false)
        );
        ResponseStatusException objExceptionNull = assertThrows(
                ResponseStatusException.class,
                () -> objNewsletterService.fSubscribe("marie@exemple.com", null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, objExceptionFalse.getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, objExceptionNull.getStatusCode());
        verify(objNewsletterSubscriberRepository, never()).save(any());
    }

    // fSubscribe_refuseUnEmailDejaInscrit : doublon
    // Reçoit : rien
    // Renvoie : rien
    // Pourquoi : garantir une erreur 409 avec un message clair
    @Test
    void fSubscribe_refuseUnEmailDejaInscrit() {
        when(objNewsletterSubscriberRepository.existsByEmail("marie@exemple.com")).thenReturn(true);

        ResponseStatusException objException = assertThrows(
                ResponseStatusException.class,
                () -> objNewsletterService.fSubscribe("marie@exemple.com", true)
        );

        assertEquals(HttpStatus.CONFLICT, objException.getStatusCode());
        assertEquals("Cette adresse e-mail est déjà inscrite.", objException.getReason());
        verify(objNewsletterSubscriberRepository, never()).save(any());
    }
}
