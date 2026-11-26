package com.ecommerce.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

// Refus d'une saisie qui désigne le champ à corriger
public class FieldErrorException extends ResponseStatusException {

    // Nom du champ, tel qu'il figure dans le corps JSON de la requête
    private final String strField;

    // FieldErrorException : constructeur (nom imposé par Java)
    // Reçoit : objStatus (le code HTTP), strMessage (le message en français), strField (le champ concerné)
    // Renvoie : rien
    // Pourquoi : indiquer au front quel champ corriger sans qu'il ait à interpréter le message
    public FieldErrorException(HttpStatus objStatus, String strMessage, String strField) {
        super(objStatus, strMessage);
        this.strField = strField;
    }

    // fGetField : donne le champ à corriger
    // Reçoit : rien
    // Renvoie : le nom du champ
    // Pourquoi : permettre au contrôleur de l'ajouter à la réponse JSON
    public String fGetField() {
        return strField;
    }
}
