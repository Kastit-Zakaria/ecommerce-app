package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

@Service
public class AuthService {

    // Message unique pour tout échec : on ne dit jamais si c'est l'email ou le mot de passe qui est faux
    public static final String STR_INVALID_CREDENTIALS = "Email ou mot de passe incorrect";

    // Messages et règles de l'inscription
    public static final String STR_REQUIRED_FIELDS = "Tous les champs sont obligatoires.";
    public static final String STR_EMAIL_ALREADY_USED = "Un compte existe déjà avec cette adresse e-mail.";
    public static final int INT_PASSWORD_MIN_LENGTH = 8;
    private static final int INT_PASSWORD_MAX_BYTES = 72;

    // Messages du changement de mot de passe
    public static final String STR_CURRENT_PASSWORD_INCORRECT = "Le mot de passe actuel est incorrect.";
    public static final String STR_PASSWORD_CONFIRMATION_MISMATCH =
            "La confirmation ne correspond pas au nouveau mot de passe.";
    public static final String STR_PASSWORD_UNCHANGED = "Le nouveau mot de passe doit être différent de l'actuel.";

    // Forme minimale d'un email : quelque chose, une arobase, un domaine avec un point, sans espace
    private static final Pattern OBJ_EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final UserRepository objUserRepository;
    private final PasswordEncoder objPasswordEncoder;

    // Empreinte BCrypt factice : sert à faire le même calcul quand l'email est inconnu (temps de réponse similaire)
    private final String strDummyHash;

    // AuthService : constructeur (nom imposé par Java), Spring injecte les dépendances
    // Reçoit : objUserRepository, objPasswordEncoder
    // Renvoie : rien
    // Pourquoi : donner au service accès aux membres et à la vérification BCrypt
    public AuthService(UserRepository objUserRepository, PasswordEncoder objPasswordEncoder) {
        this.objUserRepository = objUserRepository;
        this.objPasswordEncoder = objPasswordEncoder;
        this.strDummyHash = objPasswordEncoder.encode("empreinte-factice");
    }

    // fAuthenticate : vérifie un email et un mot de passe
    // Reçoit : strEmail (le login), strPassword (le mot de passe saisi, jamais journalisé)
    // Renvoie : le membre authentifié ; erreur 400 si un champ est vide, 401 si les identifiants sont incorrects
    // Pourquoi : centraliser la règle de connexion avec un message d'échec générique
    public User fAuthenticate(String strEmail, String strPassword) {
        if (strEmail == null || strEmail.isBlank() || strPassword == null || strPassword.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'email et le mot de passe sont obligatoires.");
        }

        String strCleanEmail = strEmail.trim().toLowerCase();
        User objUser = objUserRepository.findByEmail(strCleanEmail).orElse(null);

        if (objUser == null) {
            objPasswordEncoder.matches(strPassword, strDummyHash);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, STR_INVALID_CREDENTIALS);
        }

        if (!objPasswordEncoder.matches(strPassword, objUser.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, STR_INVALID_CREDENTIALS);
        }

        return objUser;
    }

    // fRegister : crée un compte membre à partir du formulaire d'inscription
    // Reçoit : strLastName, strFirstName, strAddress, strPostalCode, strCity, strEmail (le futur login),
    //          strPassword (le mot de passe choisi, jamais journalisé ni conservé en clair)
    // Renvoie : le membre enregistré ; erreur 400 si un champ est vide ou invalide, 409 si l'email est déjà utilisé
    // Pourquoi : appliquer côté serveur toutes les règles de l'inscription, même si le front est contourné
    public User fRegister(String strLastName, String strFirstName, String strAddress, String strPostalCode,
                          String strCity, String strEmail, String strPassword) {
        if (fIsBlank(strLastName) || fIsBlank(strFirstName) || fIsBlank(strAddress) || fIsBlank(strPostalCode)
                || fIsBlank(strCity) || fIsBlank(strEmail) || strPassword == null || strPassword.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, STR_REQUIRED_FIELDS);
        }

        String strCleanLastName = strLastName.trim();
        String strCleanFirstName = strFirstName.trim();
        String strCleanAddress = strAddress.trim();
        String strCleanPostalCode = strPostalCode.trim();
        String strCleanCity = strCity.trim();
        String strCleanEmail = strEmail.trim().toLowerCase();

        // Longueurs maximales : celles des colonnes de la table users
        // L'inscription ne désigne pas de champ dans ses erreurs (null)
        fCheckMaxLength(strCleanLastName, 100, "Le nom", null);
        fCheckMaxLength(strCleanFirstName, 100, "Le prénom", null);
        fCheckMaxLength(strCleanAddress, 255, "L'adresse", null);
        fCheckMaxLength(strCleanPostalCode, 10, "Le code postal", null);
        fCheckMaxLength(strCleanCity, 100, "La ville", null);
        fCheckMaxLength(strCleanEmail, 255, "L'adresse e-mail", null);

        if (!OBJ_EMAIL_PATTERN.matcher(strCleanEmail).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'adresse e-mail n'est pas valide.");
        }

        fCheckPasswordRules(strPassword, null);

        if (objUserRepository.findByEmail(strCleanEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, STR_EMAIL_ALREADY_USED);
        }

        User objUser = new User();
        objUser.setLastName(strCleanLastName);
        objUser.setFirstName(strCleanFirstName);
        objUser.setAddress(strCleanAddress);
        objUser.setPostalCode(strCleanPostalCode);
        objUser.setCity(strCleanCity);
        objUser.setEmail(strCleanEmail);
        objUser.setPasswordHash(objPasswordEncoder.encode(strPassword));

        try {
            return objUserRepository.saveAndFlush(objUser);
        } catch (DataIntegrityViolationException objException) {
            // Deux inscriptions simultanées avec le même email : l'index unique de la base tranche
            throw new ResponseStatusException(HttpStatus.CONFLICT, STR_EMAIL_ALREADY_USED);
        }
    }

    // fUpdateProfile : modifie les informations d'un membre connecté
    // Reçoit : lngId (l'identifiant stocké dans la session) et les six champs du formulaire « Mon compte »
    // Renvoie : le membre mis à jour ; erreur 401 s'il n'existe plus, 400 si un champ est vide ou invalide,
    //           409 si l'email appartient à un autre compte ; les erreurs 400 et 409 désignent le champ
    // Pourquoi : valider toutes les valeurs avant de modifier l'entité ; mot de passe et rôle restent intacts
    @org.springframework.transaction.annotation.Transactional
    public User fUpdateProfile(Long lngId, String strFirstName, String strLastName, String strEmail,
                               String strAddress, String strPostalCode, String strCity) {
        User objUser = fFindById(lngId);
        if (objUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté.");
        }
        // Dans l'ordre du formulaire : le premier champ vide est celui désigné
        fCheckFilled(fIsBlank(strFirstName), "firstName");
        fCheckFilled(fIsBlank(strLastName), "lastName");
        fCheckFilled(fIsBlank(strEmail), "email");
        fCheckFilled(fIsBlank(strAddress), "address");
        fCheckFilled(fIsBlank(strPostalCode), "postalCode");
        fCheckFilled(fIsBlank(strCity), "city");
        String strCleanFirstName = strFirstName.trim();
        String strCleanLastName = strLastName.trim();
        String strCleanEmail = strEmail.trim().toLowerCase();
        String strCleanAddress = strAddress.trim();
        String strCleanPostalCode = strPostalCode.trim();
        String strCleanCity = strCity.trim();
        fCheckMaxLength(strCleanFirstName, 100, "Le prénom", "firstName");
        fCheckMaxLength(strCleanLastName, 100, "Le nom", "lastName");
        fCheckMaxLength(strCleanEmail, 255, "L'adresse e-mail", "email");
        fCheckMaxLength(strCleanAddress, 255, "L'adresse", "address");
        fCheckMaxLength(strCleanPostalCode, 10, "Le code postal", "postalCode");
        fCheckMaxLength(strCleanCity, 100, "La ville", "city");
        if (!OBJ_EMAIL_PATTERN.matcher(strCleanEmail).matches()) {
            throw new FieldErrorException(HttpStatus.BAD_REQUEST, "L'adresse e-mail n'est pas valide.", "email");
        }
        User objEmailOwner = objUserRepository.findByEmail(strCleanEmail).orElse(null);
        if (objEmailOwner != null && !objEmailOwner.getId().equals(lngId)) {
            throw new FieldErrorException(HttpStatus.CONFLICT, STR_EMAIL_ALREADY_USED, "email");
        }
        objUser.setFirstName(strCleanFirstName);
        objUser.setLastName(strCleanLastName);
        objUser.setEmail(strCleanEmail);
        objUser.setAddress(strCleanAddress);
        objUser.setPostalCode(strCleanPostalCode);
        objUser.setCity(strCleanCity);
        try {
            return objUserRepository.saveAndFlush(objUser);
        } catch (DataIntegrityViolationException objException) {
            // L'index unique protège aussi contre deux changements simultanés vers le même email.
            throw new FieldErrorException(HttpStatus.CONFLICT, STR_EMAIL_ALREADY_USED, "email");
        }
    }

    // fChangePassword : remplace le mot de passe d'un membre connecté
    // Reçoit : lngId (l'identifiant stocké dans la session), strCurrentPassword (le mot de passe actuel),
    //          strNewPassword (le nouveau), strConfirmation (sa seconde saisie) ; aucun n'est journalisé
    // Renvoie : le membre mis à jour ; erreur 401 s'il n'existe plus, 400 si un champ est vide, si le mot de passe
    //           actuel est faux, ou si le nouveau est invalide, mal confirmé ou identique à l'actuel ;
    //           les erreurs 400 désignent le champ, sauf la confirmation différente (la saisie reprend au début)
    // Pourquoi : n'autoriser le changement qu'à la personne qui connaît le mot de passe actuel
    @org.springframework.transaction.annotation.Transactional
    public User fChangePassword(Long lngId, String strCurrentPassword, String strNewPassword, String strConfirmation) {
        User objUser = fFindById(lngId);
        if (objUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté.");
        }

        // Les mots de passe ne sont jamais rognés : les espaces en font partie, comme à l'inscription
        fCheckFilled(fIsEmpty(strCurrentPassword), "currentPassword");
        fCheckFilled(fIsEmpty(strNewPassword), "newPassword");
        fCheckFilled(fIsEmpty(strConfirmation), "confirmation");

        // 400 et non 401 : la session reste valable, le membre ne doit pas être déconnecté
        if (!objPasswordEncoder.matches(strCurrentPassword, objUser.getPasswordHash())) {
            throw new FieldErrorException(HttpStatus.BAD_REQUEST, STR_CURRENT_PASSWORD_INCORRECT, "currentPassword");
        }

        fCheckPasswordRules(strNewPassword, "newPassword");

        if (!strNewPassword.equals(strConfirmation)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, STR_PASSWORD_CONFIRMATION_MISMATCH);
        }

        if (strNewPassword.equals(strCurrentPassword)) {
            throw new FieldErrorException(HttpStatus.BAD_REQUEST, STR_PASSWORD_UNCHANGED, "newPassword");
        }

        objUser.setPasswordHash(objPasswordEncoder.encode(strNewPassword));
        return objUserRepository.saveAndFlush(objUser);
    }

    // fCheckPasswordRules : vérifie qu'un mot de passe choisi respecte les règles du site
    // Reçoit : strPassword (le mot de passe choisi, non vide, jamais journalisé),
    //          strField (le champ à désigner en cas de refus, ou null)
    // Renvoie : rien ; erreur 400 s'il est trop court ou trop long
    // Pourquoi : appliquer les mêmes règles et les mêmes messages à l'inscription et au changement de mot de passe
    private void fCheckPasswordRules(String strPassword, String strField) {
        if (strPassword.length() < INT_PASSWORD_MIN_LENGTH) {
            throw fBuildInputError(
                    "Le mot de passe doit contenir au moins " + INT_PASSWORD_MIN_LENGTH + " caractères.", strField);
        }

        // BCrypt n'utilise que les 72 premiers octets : au-delà, le mot de passe serait tronqué sans le dire
        if (strPassword.getBytes(StandardCharsets.UTF_8).length > INT_PASSWORD_MAX_BYTES) {
            throw fBuildInputError("Le mot de passe est trop long.", strField);
        }
    }

    // fCheckFilled : refuse un champ obligatoire resté vide
    // Reçoit : blMissing (true si rien n'a été saisi), strField (le champ vérifié)
    // Renvoie : rien ; erreur 400 qui désigne ce champ s'il est vide
    // Pourquoi : indiquer le premier champ à compléter, avec le même message pour tous
    private void fCheckFilled(boolean blMissing, String strField) {
        if (blMissing) {
            throw new FieldErrorException(HttpStatus.BAD_REQUEST, STR_REQUIRED_FIELDS, strField);
        }
    }

    // fBuildInputError : prépare le refus 400 d'une saisie
    // Reçoit : strMessage (le message en français), strField (le champ concerné, ou null)
    // Renvoie : l'erreur à lever, avec le champ seulement s'il est indiqué
    // Pourquoi : partager les mêmes contrôles entre les routes qui désignent un champ et l'inscription
    private ResponseStatusException fBuildInputError(String strMessage, String strField) {
        if (strField == null) {
            return new ResponseStatusException(HttpStatus.BAD_REQUEST, strMessage);
        }
        return new FieldErrorException(HttpStatus.BAD_REQUEST, strMessage, strField);
    }

    // fIsEmpty : indique si un mot de passe est absent ou vide
    // Reçoit : strValue, la valeur saisie
    // Renvoie : true si rien n'a été saisi
    // Pourquoi : contrairement aux autres champs, un mot de passe peut contenir uniquement des espaces
    private boolean fIsEmpty(String strValue) {
        return strValue == null || strValue.isEmpty();
    }

    // fIsBlank : indique si un champ texte est absent ou ne contient que des espaces
    // Reçoit : strValue, la valeur saisie
    // Renvoie : true si le champ est vide
    // Pourquoi : appliquer la même règle « obligatoire » à tous les champs de l'inscription
    private boolean fIsBlank(String strValue) {
        return strValue == null || strValue.isBlank();
    }

    // fCheckMaxLength : refuse une valeur plus longue que sa colonne en base
    // Reçoit : strValue (la valeur nettoyée), intMax (la longueur maximale), strLabel (le nom du champ pour le message),
    //          strField (le champ à désigner en cas de refus, ou null)
    // Renvoie : rien ; erreur 400 si la valeur est trop longue
    // Pourquoi : renvoyer un message clair plutôt qu'une erreur de la base de données
    private void fCheckMaxLength(String strValue, int intMax, String strLabel, String strField) {
        if (strValue.length() > intMax) {
            throw fBuildInputError(strLabel + " ne doit pas dépasser " + intMax + " caractères.", strField);
        }
    }

    // fFindById : retrouve un membre à partir de son identifiant de session
    // Reçoit : lngId, l'identifiant stocké dans la session
    // Renvoie : le membre, ou null s'il n'existe plus
    // Pourquoi : permettre à /api/auth/me de restituer l'utilisateur connecté
    public User fFindById(Long lngId) {
        return objUserRepository.findById(lngId).orElse(null);
    }
}
