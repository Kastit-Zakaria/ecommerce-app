package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Nom de l'attribut de session qui contient l'identifiant du membre connecté
    private static final String STR_SESSION_USER_ID = "userId";

    // LoginRequest : corps JSON attendu { "email": "...", "password": "..." }
    // toString est redéfini pour que le mot de passe n'apparaisse jamais dans un log
    public record LoginRequest(String email, String password) {
        @Override
        public String toString() {
            return "LoginRequest[email=" + email + ", password=***]";
        }
    }

    // RegisterRequest : corps JSON attendu par l'inscription
    // { "lastName", "firstName", "address", "postalCode", "city", "email", "password" }
    // toString est redéfini pour que le mot de passe n'apparaisse jamais dans un log
    public record RegisterRequest(String lastName, String firstName, String address, String postalCode,
                                  String city, String email, String password) {
        @Override
        public String toString() {
            return "RegisterRequest[lastName=" + lastName + ", firstName=" + firstName + ", address=" + address
                    + ", postalCode=" + postalCode + ", city=" + city + ", email=" + email + ", password=***]";
        }
    }

    // PasswordRequest : corps JSON attendu par le changement de mot de passe
    // { "currentPassword", "newPassword", "confirmation" }
    // toString est redéfini pour qu'aucun mot de passe n'apparaisse jamais dans un log
    public record PasswordRequest(String currentPassword, String newPassword, String confirmation) {
        @Override
        public String toString() {
            return "PasswordRequest[currentPassword=***, newPassword=***, confirmation=***]";
        }
    }

    // UserResponse : ce que l'API renvoie d'un membre (jamais le mot de passe ni son empreinte)
    public record UserResponse(String firstName, String lastName, String email, String address, String postalCode, String city) {
    }

    private final AuthService objAuthService;

    // AuthController : constructeur (nom imposé par Java), Spring injecte le service
    // Reçoit : objAuthService
    // Renvoie : rien
    // Pourquoi : donner au contrôleur accès à la connexion
    public AuthController(AuthService objAuthService) {
        this.objAuthService = objAuthService;
    }

    // fToResponse : convertit un membre en réponse publique
    // Reçoit : objUser, le membre
    // Renvoie : prénom, nom et email uniquement
    // Pourquoi : ne jamais exposer password_hash
    private UserResponse fToResponse(User objUser) {
        return new UserResponse(objUser.getFirstName(), objUser.getLastName(), objUser.getEmail(),
                objUser.getAddress(), objUser.getPostalCode(), objUser.getCity());
    }

    // fLogin : connecte un membre (POST /api/auth/login)
    // Reçoit : objRequest (email et mot de passe), objHttpRequest (pour gérer la session)
    // Renvoie : 200 avec { firstName, lastName, email } ; 400 si un champ est vide ; 401 si échec
    // Pourquoi : ouvrir une session HTTP après vérification BCrypt
    @PostMapping("/login")
    public ResponseEntity<UserResponse> fLogin(@RequestBody LoginRequest objRequest, HttpServletRequest objHttpRequest) {
        User objUser = objAuthService.fAuthenticate(objRequest.email(), objRequest.password());
        fOpenSession(objHttpRequest, objUser);
        return ResponseEntity.ok(fToResponse(objUser));
    }

    // fRegister : inscrit un visiteur puis le connecte (POST /api/auth/register)
    // Reçoit : objRequest (les 7 champs du formulaire), objHttpRequest (pour ouvrir la session)
    // Renvoie : 201 avec { firstName, lastName, email } ; 400 si un champ est vide ou invalide ; 409 si l'email existe déjà
    // Pourquoi : créer le compte et afficher aussitôt « Bienvenue, <prénom> », sans seconde saisie du mot de passe
    @PostMapping("/register")
    public ResponseEntity<UserResponse> fRegister(@RequestBody RegisterRequest objRequest, HttpServletRequest objHttpRequest) {
        User objUser = objAuthService.fRegister(
                objRequest.lastName(),
                objRequest.firstName(),
                objRequest.address(),
                objRequest.postalCode(),
                objRequest.city(),
                objRequest.email(),
                objRequest.password()
        );
        fOpenSession(objHttpRequest, objUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(fToResponse(objUser));
    }

    // fOpenSession : ouvre une session HTTP neuve pour un membre
    // Reçoit : objHttpRequest (la requête en cours), objUser (le membre à connecter)
    // Renvoie : rien
    // Pourquoi : partager la même ouverture de session entre la connexion, l'inscription
    //            et le changement de mot de passe
    private void fOpenSession(HttpServletRequest objHttpRequest, User objUser) {
        // Protection contre la fixation de session : l'ancienne session est détruite, une nouvelle est créée
        HttpSession objOldSession = objHttpRequest.getSession(false);
        if (objOldSession != null) {
            objOldSession.invalidate();
        }
        HttpSession objNewSession = objHttpRequest.getSession(true);
        objNewSession.setAttribute(STR_SESSION_USER_ID, objUser.getId());
    }

    // fMe : renvoie le membre connecté (GET /api/auth/me)
    // Reçoit : objHttpRequest (pour lire la session)
    // Renvoie : 200 avec { firstName, lastName, email }, ou 401 sans session
    // Pourquoi : retrouver la connexion après un rechargement de la page
    @GetMapping("/me")
    public ResponseEntity<UserResponse> fMe(HttpServletRequest objHttpRequest) {
        HttpSession objSession = objHttpRequest.getSession(false);
        if (objSession == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté.");
        }

        Object objUserId = objSession.getAttribute(STR_SESSION_USER_ID);
        if (!(objUserId instanceof Long lngUserId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté.");
        }

        User objUser = objAuthService.fFindById(lngUserId);
        if (objUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté.");
        }

        return ResponseEntity.ok(fToResponse(objUser));
    }

    // La session conserve un ID stable, y compris après changement de l'adresse e-mail.
    public record ProfileRequest(String firstName, String lastName, String email,
                                 String address, String postalCode, String city) {
    }

    @Value("${app.cors.allowed-origin}")
    private String strAllowedOrigin;

    // PUT exige la représentation complète des six champs éditables.
    // Aucun identifiant, rôle ou mot de passe fourni par le client n'est utilisé.
    @PutMapping("/me")
    public ResponseEntity<UserResponse> fUpdateMe(@RequestBody ProfileRequest objRequest,
                                                  HttpServletRequest objHttpRequest) {
        Long lngUserId = fRequireUserId(objHttpRequest);
        fCheckOrigin(objHttpRequest);
        User objUser = objAuthService.fUpdateProfile(lngUserId, objRequest.firstName(), objRequest.lastName(),
                objRequest.email(), objRequest.address(), objRequest.postalCode(), objRequest.city());
        return ResponseEntity.ok(fToResponse(objUser));
    }

    // fChangePassword : change le mot de passe du membre connecté (PUT /api/auth/me/password)
    // Reçoit : objRequest (mot de passe actuel, nouveau et confirmation), objHttpRequest (pour la session)
    // Renvoie : 204 sans contenu ; 400 si la saisie est refusée ; 401 sans session ; 403 si l'origine est refusée
    // Pourquoi : permettre au membre de modifier son mot de passe tout en restant connecté
    @PutMapping("/me/password")
    public ResponseEntity<Void> fChangePassword(@RequestBody PasswordRequest objRequest,
                                                HttpServletRequest objHttpRequest) {
        Long lngUserId = fRequireUserId(objHttpRequest);
        fCheckOrigin(objHttpRequest);
        User objUser = objAuthService.fChangePassword(lngUserId, objRequest.currentPassword(),
                objRequest.newPassword(), objRequest.confirmation());
        // La session est renouvelée après le changement (protection contre la fixation de session)
        fOpenSession(objHttpRequest, objUser);
        return ResponseEntity.noContent().build();
    }

    // fRequireUserId : lit l'identifiant du membre dans la session
    // Reçoit : objHttpRequest (la requête en cours)
    // Renvoie : l'identifiant du membre connecté ; erreur 401 sans session
    // Pourquoi : réserver les modifications du compte au membre connecté, sans faire confiance au client
    private Long fRequireUserId(HttpServletRequest objHttpRequest) {
        HttpSession objSession = objHttpRequest.getSession(false);
        if (objSession == null || !(objSession.getAttribute(STR_SESSION_USER_ID) instanceof Long lngUserId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté.");
        }
        return lngUserId;
    }

    // fCheckOrigin : refuse une requête envoyée par une autre origine que le front
    // Reçoit : objHttpRequest (la requête en cours)
    // Renvoie : rien ; erreur 403 si l'en-tête Origin désigne une origine non autorisée
    // Pourquoi : protéger les écritures authentifiées par cookie contre les requêtes d'un autre site
    private void fCheckOrigin(HttpServletRequest objHttpRequest) {
        String strOrigin = objHttpRequest.getHeader("Origin");
        if (strOrigin != null && !strAllowedOrigin.equals(strOrigin)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Origine non autorisée.");
        }
    }

    // fLogout : déconnecte le membre (POST /api/auth/logout)
    // Reçoit : objHttpRequest (pour retrouver la session)
    // Renvoie : 204 dans tous les cas, avec ou sans session
    // Pourquoi : détruire la session côté serveur ; l'appel reste inoffensif si le membre est déjà déconnecté
    @PostMapping("/logout")
    public ResponseEntity<Void> fLogout(HttpServletRequest objHttpRequest) {
        HttpSession objSession = objHttpRequest.getSession(false);
        if (objSession != null) {
            objSession.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    // fHandleError : transforme l'erreur du service en réponse JSON { "message": "..." }
    // Reçoit : objException, l'erreur levée (400, 401 ou 409)
    // Renvoie : la réponse avec le même code HTTP et le message en français
    // Pourquoi : permettre au front d'afficher un message clair
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> fHandleError(ResponseStatusException objException) {
        return ResponseEntity.status(objException.getStatusCode()).body(Map.of("message", objException.getReason()));
    }
}
