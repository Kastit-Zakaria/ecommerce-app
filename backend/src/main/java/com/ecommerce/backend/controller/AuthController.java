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

    // UserResponse : ce que l'API renvoie d'un membre (jamais le mot de passe ni son empreinte)
    public record UserResponse(String firstName, String lastName, String email) {
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
        return new UserResponse(objUser.getFirstName(), objUser.getLastName(), objUser.getEmail());
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
    // Pourquoi : partager la même ouverture de session entre la connexion et l'inscription
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
