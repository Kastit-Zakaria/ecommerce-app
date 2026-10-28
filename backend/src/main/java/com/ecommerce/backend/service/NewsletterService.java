package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.NewsletterSubscriber;
import com.ecommerce.backend.repository.NewsletterSubscriberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
public class NewsletterService {

    // Format d'e-mail simple : texte@domaine.extension, sans espace
    private static final Pattern OBJ_EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final NewsletterSubscriberRepository objNewsletterSubscriberRepository;

    // NewsletterService : constructeur (nom imposé par Java), Spring injecte le repository
    // Reçoit : objNewsletterSubscriberRepository
    // Renvoie : rien
    // Pourquoi : donner au service accès à la table des inscrits
    public NewsletterService(NewsletterSubscriberRepository objNewsletterSubscriberRepository) {
        this.objNewsletterSubscriberRepository = objNewsletterSubscriberRepository;
    }

    // fSubscribe : inscrit une adresse e-mail à la newsletter
    // Reçoit : strEmail (l'adresse saisie), blConsent (true si la personne a donné son consentement)
    // Renvoie : l'inscrit enregistré ; erreur 400 si l'e-mail est invalide ou le consentement absent, 409 si déjà inscrit
    // Pourquoi : respecter le RGPD (consentement obligatoire, date conservée) et éviter les doublons
    public NewsletterSubscriber fSubscribe(String strEmail, Boolean blConsent) {
        if (blConsent == null || !blConsent) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le consentement est obligatoire pour s'inscrire.");
        }

        if (strEmail == null || !OBJ_EMAIL_PATTERN.matcher(strEmail.trim()).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'adresse e-mail n'est pas valide.");
        }

        String strCleanEmail = strEmail.trim().toLowerCase();

        if (objNewsletterSubscriberRepository.existsByEmail(strCleanEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette adresse e-mail est déjà inscrite.");
        }

        NewsletterSubscriber objSubscriber = new NewsletterSubscriber();
        objSubscriber.setEmail(strCleanEmail);
        objSubscriber.setConsentDate(LocalDateTime.now());

        return objNewsletterSubscriberRepository.save(objSubscriber);
    }
}
