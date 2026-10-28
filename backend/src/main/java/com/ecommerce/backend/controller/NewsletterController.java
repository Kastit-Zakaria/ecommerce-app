package com.ecommerce.backend.controller;

import com.ecommerce.backend.service.NewsletterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    // NewsletterRequest : corps JSON attendu { "email": "...", "consent": true }
    public record NewsletterRequest(String email, Boolean consent) {
    }

    private final NewsletterService objNewsletterService;

    // NewsletterController : constructeur (nom imposé par Java), Spring injecte le service
    // Reçoit : objNewsletterService
    // Renvoie : rien
    // Pourquoi : donner au contrôleur accès à l'inscription à la newsletter
    public NewsletterController(NewsletterService objNewsletterService) {
        this.objNewsletterService = objNewsletterService;
    }

    // fSubscribe : inscrit un e-mail à la newsletter (POST /api/newsletter)
    // Reçoit : objRequest, le corps JSON (email et consentement)
    // Renvoie : 201 avec un message de confirmation
    // Pourquoi : permettre l'inscription depuis le formulaire du pied de page
    @PostMapping
    public ResponseEntity<Map<String, String>> fSubscribe(@RequestBody NewsletterRequest objRequest) {
        objNewsletterService.fSubscribe(objRequest.email(), objRequest.consent());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Merci, votre inscription est enregistrée."));
    }

    // fHandleError : transforme l'erreur du service en réponse JSON { "message": "..." }
    // Reçoit : objException, l'erreur levée par le service (400 ou 409)
    // Renvoie : la réponse avec le même code HTTP et le message en français
    // Pourquoi : permettre au front d'afficher un message clair à l'utilisateur
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> fHandleError(ResponseStatusException objException) {
        return ResponseEntity.status(objException.getStatusCode()).body(Map.of("message", objException.getReason()));
    }
}
