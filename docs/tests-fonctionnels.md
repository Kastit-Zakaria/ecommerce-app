# Cahier de tests fonctionnels (manuels)

**Dernière exécution : 25 novembre 2026** (historique en fin de document)

- Environnement : local, Windows 11, Google Chrome 158.0.8127.38, fenêtre 1440 × 900. Site sur http://localhost:5173, API sur http://localhost:8080, base MySQL locale.
- Résumé de la dernière exécution : **98 OK / 0 KO** sur 98 scénarios. Première passe du jour : 94 OK / 4 KO ; trois scénarios mis à jour suite à l'US6 et un défaut corrigé dans la fiche produit, puis scénarios concernés rejoués (détail dans l'historique).
- Plus de limite connue : le focus est désormais piégé dans la fiche produit (voir TA-04).

Prérequis : MySQL (XAMPP) démarré, back lancé (`./mvnw spring-boot:run`), front lancé (`npm run dev`), page d'accueil ouverte dans le navigateur.
Les colonnes « Résultat obtenu » et « Statut » (OK / KO) sont à remplir lors de l'exécution.

## US1 — Liste des catégories

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US1-01 | US1 | 1. Ouvrir la page d'accueil. | La liste des catégories est visible (navigation et section « Nos univers »). | La navigation affiche les 5 catégories (Hommes, Femmes, Enfants, Accessoires, Nouveautés) et la section « Nos univers » en affiche 4. | OK |
| TF-US1-02 | US1 | 1. Ouvrir la page d'accueil. 2. Comparer avec les catégories en base. | Toutes les catégories de la base sont affichées, avec leur nom. | Les 5 catégories de la base sont dans la navigation, avec leur nom et dans le même ordre ; « Nos univers » n'en montre que 4, « Nouveautés » n'ayant pas d'image. | OK |
| TF-US1-03 | US1 | 1. Arrêter le back. 2. Recharger la page d'accueil. | La page s'affiche sans plantage (aucune catégorie affichée, erreur seulement dans la console). | Page affichée sans plantage : en-tête, vidéo et pied de page présents, aucune catégorie visible ; les erreurs n'apparaissent que dans la console. | OK |

## US2 — Produits d'une catégorie

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US2-01 | US2 | 1. Cliquer sur une catégorie contenant des produits. | Les produits de la catégorie s'affichent en miniatures (image + prix) avec le nom de la catégorie en titre. | Clic sur « Femmes » : titre « Femmes » et 4 miniatures, chacune avec son image chargée et son prix (64,90 €, 119,00 €, 79,00 €, 34,90 €). | OK |
| TF-US2-02 | US2 | 1. Cliquer sur une catégorie. 2. Survoler une miniature avec la souris. | Le nom du produit apparaît en infobulle. | Au survol de la première miniature, l'infobulle « Robe d'été » s'affiche. | OK |
| TF-US2-03 | US2 | 1. Cliquer sur une catégorie sans produit. | Le message « Aucun produit dans cette catégorie. » s'affiche. | Clic sur « Nouveautés » : le message « Aucun produit dans cette catégorie. » s'affiche, sans miniature. | OK |
| TF-US2-04 | US2 | 1. Cliquer sur une catégorie. 2. Observer l'onglet du navigateur (icône de chargement) et la position de la page. | La page ne se recharge pas : seule la zone produits est mise à jour. | Aucun rechargement (l'état de la page est conservé) et l'URL reste « / » ; la page descend jusqu'à la zone produits (1 479 px). | OK |
| TF-US2-05 | US2 | 1. Cliquer sur une catégorie A, puis sur une catégorie B. | Les produits de B remplacent ceux de A, sans rechargement de la page. | De « Hommes » (3 produits) à « Femmes » (4 produits), la liste est remplacée sans rechargement de la page. | OK |

## US3 — Détail d'un produit

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US3-01 | US3 | 1. Cliquer sur « Voir le produit » d'une miniature. | Une fenêtre (modal) s'ouvre avec le nom, la marque, le prix et l'image du produit. | La fenêtre s'ouvre avec « Marque C », « Robe d'été », « 64,90 € » et l'image du produit chargée. | OK |
| TF-US3-02 | US3 | 1. Ouvrir la fiche d'un produit. 2. Vérifier le prix. | Le prix est au format belge (ex. « 64,90 € »). | Le prix s'affiche « 64,90 € », avec virgule décimale et symbole euro. | OK |
| TF-US3-03 | US3 | 1. Ouvrir la fiche d'un produit. 2. Observer l'onglet du navigateur. | La page ne se recharge pas et l'URL ne change pas. | Aucun rechargement et l'URL reste « / » à l'ouverture de la fiche. | OK |
| TF-US3-04 | US3 | 1. Ouvrir la fiche d'un produit. 2. Cliquer sur ✕ (ou en dehors de la fenêtre). | Le modal se ferme et on retrouve la liste des produits au même endroit. | Fenêtre fermée par ✕ puis par un clic sur le fond ; les 4 produits sont affichés à la même position de défilement (1 479 px). | OK |

## US4 — Connexion

Prérequis : le compte de test de `database/ecommercedb.sql` est présent dans la table `users`.

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US4-01 | US4 | 1. Ouvrir la page d'accueil. 2. Cliquer sur l'icône « Mon compte » de l'en-tête. | Un modal « Connexion » s'ouvre avec les champs « Adresse e-mail » et « Mot de passe » ; le focus est sur le champ e-mail ; la page ne défile plus. | Modal « Connexion » ouvert avec les deux champs ; focus sur « Adresse e-mail » ; défilement de la page bloqué. | OK |
| TF-US4-02 | US4 | 1. Ouvrir le modal de connexion. 2. Saisir l'e-mail et le mot de passe du compte de test. 3. Cliquer sur « Se connecter ». | Le modal se ferme, le visiteur reste sur la même page et l'en-tête affiche « Bienvenue, [prénom] ». | Exécuté avec le compte camille.martin@exemple.be depuis « Qui sommes-nous » : réponse 200, modal fermé, le visiteur reste sur /about et l'en-tête affiche « Bienvenue, Camille ». | OK |
| TF-US4-03 | US4 | 1. Ouvrir le modal. 2. Cliquer sur « Se connecter » sans rien saisir. | Un message indique que l'e-mail et le mot de passe sont obligatoires ; aucune connexion n'est tentée. | Message « L'email et le mot de passe sont obligatoires. » ; aucune requête de connexion envoyée. | OK |
| TF-US4-04 | US4 | 1. Ouvrir le modal. 2. Saisir l'e-mail seul, puis cliquer sur « Se connecter ». 3. Recommencer avec le mot de passe seul. | Dans les deux cas, le message « obligatoires » s'affiche et le modal reste ouvert. | E-mail seul puis mot de passe seul : chaque fois « L'email et le mot de passe sont obligatoires. », modal ouvert, aucune requête envoyée. | OK |
| TF-US4-05 | US4 | 1. Saisir l'e-mail du compte de test et un mauvais mot de passe. 2. Cliquer sur « Se connecter ». | Le message « Email ou mot de passe incorrect » s'affiche, le modal reste ouvert, le champ mot de passe est vidé et reçoit le focus. | Avec camille.martin@exemple.be : réponse 401, message « Email ou mot de passe incorrect », modal ouvert, mot de passe vidé et focus dessus. | OK |
| TF-US4-06 | US4 | 1. Saisir un e-mail inconnu et un mot de passe quelconque. 2. Cliquer sur « Se connecter ». | Le même message « Email ou mot de passe incorrect » s'affiche (rien n'indique si l'e-mail ou le mot de passe est faux). | Réponse 401 avec le même message « Email ou mot de passe incorrect » ; le corps de la réponse est identique à celui du mauvais mot de passe. | OK |
| TF-US4-07 | US4 | 1. Se connecter. 2. Naviguer vers « Qui sommes-nous », « Confidentialité » et « Cookies ». | « Bienvenue, [prénom] » reste visible dans l'en-tête sur chaque page. | « Bienvenue, Camille » visible sur « Qui sommes-nous », « Confidentialité » et « Cookies ». | OK |
| TF-US4-08 | US4 | 1. Se connecter. 2. Recharger la page (F5). | « Bienvenue, [prénom] » s'affiche toujours : la session est retrouvée. | Après F5, « Bienvenue, Camille » s'affiche toujours. | OK |
| TF-US4-09 | US4 | 1. Se connecter. 2. Cliquer de nouveau sur l'icône « Mon compte ». | Le modal de connexion ne s'ouvre plus. | Le modal de connexion ne s'ouvre pas ; c'est le panneau du compte qui s'affiche. | OK |
| TF-US4-10 | US4 | 1. Ouvrir le modal. 2. Fermer successivement avec la croix ✕, avec un clic sur le fond sombre, puis avec la touche Échap. | Le modal se ferme à chaque fois, la page peut de nouveau défiler et le focus revient sur l'icône « Mon compte ». | Fermeture par ✕, par le fond sombre et par Échap : à chaque fois, modal fermé, défilement rétabli et focus sur « Mon compte ». | OK |
| TF-US4-11 | US4 | 1. Ouvrir le modal. 2. Appuyer plusieurs fois sur Tab, puis sur Maj+Tab. | Le focus circule uniquement entre la croix, les deux champs et le bouton ; il ne sort jamais du modal. | Tab : mot de passe, « Se connecter », « Créer un compte », croix, e-mail, puis Maj+Tab en sens inverse ; le focus ne sort jamais du modal. Le lien « Créer un compte », ajouté avec l'inscription, fait aussi partie du cycle. | OK |
| TF-US4-12 | US4 | 1. Ouvrir le modal. 2. Saisir un mot de passe et observer le champ. 3. Dans les outils de développement (F12, onglet Réseau), observer la réponse de la connexion. | Le mot de passe est masqué à la saisie ; la réponse contient le prénom, le nom, l'e-mail, l'adresse, le code postal et la ville du membre, et jamais le mot de passe ni son empreinte. | Mot de passe masqué (type password). Réponse 200 avec exactement six informations : prénom, nom, e-mail, adresse, code postal et ville ; ni mot de passe ni empreinte. | OK |
| TF-US4-13 | US4 | 1. Arrêter le back. 2. Saisir des identifiants et cliquer sur « Se connecter ». | Un message indique que la connexion est impossible pour le moment ; la page ne plante pas. | Message « Connexion impossible pour le moment. Veuillez réessayer plus tard. » ; la page reste utilisable. | OK |
| TF-US4-14 | US4 | 1. Activer un lecteur d'écran (ou observer l'arbre d'accessibilité). 2. Provoquer une erreur de connexion. | Le message d'erreur est annoncé au lecteur d'écran sans déplacer le focus hors du formulaire ; chaque champ est annoncé avec son label. | Le message « Email ou mot de passe incorrect » s'inscrit dans une zone d'alerte (role="alert") ; le focus reste dans le formulaire ; les champs sont reliés à leur label (« Adresse e-mail », « Mot de passe »). | OK |

## US5 — Inscription

Prérequis : être déconnecté. Utiliser une adresse e-mail qui n'a encore aucun compte (par exemple `nouveau.membre@exemple.com`) ; après les tests, supprimer ce compte de la table `users` si nécessaire.

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US5-01 | US5 | 1. Sur l'accueil, cliquer sur l'icône « Mon compte ». 2. Cliquer sur « Créer un compte ». | La fenêtre « Connexion » est remplacée par la fenêtre « Créer un compte », avec les champs Nom, Prénom, Adresse, Code postal, Ville, Adresse e-mail et Mot de passe ; le focus est sur « Nom ». | La fenêtre « Créer un compte » remplace la connexion, avec les sept champs dans cet ordre ; focus sur « Nom ». | OK |
| TF-US5-02 | US5 | 1. Aller sur « Qui sommes-nous », puis sur « Cookies ». 2. Sur chaque page, ouvrir l'inscription comme au scénario précédent. | L'inscription s'ouvre depuis chaque page, sans quitter la page. | L'inscription s'ouvre sur « Qui sommes-nous » et sur « Cookies », l'adresse de la page restant inchangée. | OK |
| TF-US5-03 | US5 | 1. Ouvrir l'inscription. 2. Remplir les sept champs avec des valeurs valides (mot de passe de 8 caractères ou plus). 3. Cliquer sur « Créer mon compte ». | La fenêtre se ferme, le visiteur reste sur la même page et l'en-tête affiche « Bienvenue, [prénom saisi] ». | Inscription de camille.martin@exemple.be depuis l'accueil : réponse 201, fenêtre fermée, le visiteur reste sur l'accueil et l'en-tête affiche « Bienvenue, Camille ». | OK |
| TF-US5-04 | US5 | 1. Après le scénario précédent, naviguer vers deux autres pages. 2. Recharger la page (F5). | « Bienvenue, [prénom] » reste affiché sur chaque page et après le rechargement. | « Bienvenue, Camille » affiché sur « Mentions légales », « Qui sommes-nous » et après F5. | OK |
| TF-US5-05 | US5 | 1. Se déconnecter. 2. Se connecter avec l'e-mail et le mot de passe choisis à l'inscription. | La connexion réussit et « Bienvenue, [prénom] » s'affiche. | Connexion avec l'e-mail et le mot de passe de l'inscription : réponse 200, « Bienvenue, Camille ». | OK |
| TF-US5-06 | US5 | 1. Ouvrir l'inscription. 2. Cliquer sur « Créer mon compte » sans rien saisir. | Le message « Tous les champs sont obligatoires. » s'affiche et le focus va sur « Nom » ; aucun compte n'est créé. | Message « Tous les champs sont obligatoires. », focus sur « Nom », aucune requête d'inscription envoyée. | OK |
| TF-US5-07 | US5 | 1. Remplir tous les champs sauf « Ville ». 2. Cliquer sur « Créer mon compte ». 3. Recommencer en laissant vide un autre champ (par exemple « Adresse »). | Le message « Tous les champs sont obligatoires. » s'affiche et le focus va sur le champ vide ; les autres champs gardent leur valeur. | « Ville » vide puis « Adresse » vide : message « Tous les champs sont obligatoires. », focus sur « Ville » puis sur « Adresse » ; les autres champs gardent leur valeur ; aucune requête envoyée. | OK |
| TF-US5-08 | US5 | 1. Remplir tous les champs avec un e-mail sans arobase (par exemple `nouveau.exemple.com`). 2. Cliquer sur « Créer mon compte ». | Le message « L'adresse e-mail n'est pas valide. » s'affiche et le focus va sur l'e-mail. | Avec `nouveau.exemple.com` : message « L'adresse e-mail n'est pas valide. », focus sur l'e-mail. | OK |
| TF-US5-09 | US5 | 1. Remplir tous les champs avec un mot de passe de 7 caractères. 2. Cliquer sur « Créer mon compte ». | Le message « Le mot de passe doit contenir au moins 8 caractères. » s'affiche et le focus va sur le mot de passe. | Message « Le mot de passe doit contenir au moins 8 caractères. », focus sur le mot de passe, aucune requête envoyée. | OK |
| TF-US5-10 | US5 | 1. Remplir tous les champs avec l'e-mail du compte de test (`compte.test@exemple.com`), en majuscules. 2. Cliquer sur « Créer mon compte ». | Le message « Un compte existe déjà avec cette adresse e-mail. » s'affiche ; le focus va sur l'e-mail ; le mot de passe est vidé, les autres champs sont conservés ; aucun second compte n'est créé. | Avec `COMPTE.TEST@EXEMPLE.COM` : réponse 409, message « Un compte existe déjà avec cette adresse e-mail. », focus sur l'e-mail, mot de passe vidé, autres champs conservés ; nombre de comptes en base inchangé (3). | OK |
| TF-US5-11 | US5 | 1. Dans la fenêtre d'inscription, cliquer sur « Se connecter ». | La fenêtre « Connexion » remplace l'inscription. | La fenêtre « Connexion » remplace l'inscription. | OK |
| TF-US5-12 | US5 | 1. Ouvrir l'inscription. 2. Fermer avec la croix ✕, puis avec un clic sur le fond sombre, puis avec Échap. 3. Rouvrir et appuyer plusieurs fois sur Tab, puis Maj+Tab. | La fenêtre se ferme à chaque fois et le focus revient sur l'icône « Mon compte » ; le focus ne sort jamais de la fenêtre avec Tab. | Fermeture par ✕, par le fond et par Échap : focus sur « Mon compte » à chaque fois. Tab parcourt les sept champs, le lien « politique de confidentialité », « Créer mon compte », « Se connecter », la croix, puis revient sur « Nom » ; Maj+Tab reste aussi dans la fenêtre. | OK |
| TF-US5-13 | US5 | 1. Réussir une inscription. 2. Dans phpMyAdmin, afficher la ligne du nouveau membre dans `users`. 3. Dans les outils de développement (F12, onglet Réseau), observer la réponse de « register ». | En base, `password_hash` commence par `$2a$` (empreinte BCrypt, jamais le mot de passe en clair) et l'e-mail est en minuscules ; la réponse (code 201) contient le prénom, le nom, l'e-mail, l'adresse, le code postal et la ville, et jamais le mot de passe ni son empreinte. | Inscription de camille.martin@exemple.be. En base : `password_hash` commence par `$2a$10$` (60 caractères), e-mail en minuscules, rôle `ROLE_USER`. Réponse 201 avec exactement six informations : prénom, nom, e-mail, adresse, code postal et ville ; ni mot de passe ni empreinte. | OK |
| TF-US5-14 | US5 | 1. Arrêter le back. 2. Remplir l'inscription et cliquer sur « Créer mon compte ». | Le message « Inscription impossible pour le moment. Veuillez réessayer plus tard. » s'affiche ; la page ne plante pas. | Message « Inscription impossible pour le moment. Veuillez réessayer plus tard. » ; la page reste utilisable. | OK |

## US6 — Modification des informations personnelles

Prérequis : être connecté, puis ouvrir la page « Mon compte » (icône « Mon compte », puis « Paramètres »). Le compte de test (`compte.test@exemple.com`) sert d'« autre compte » au scénario TF-US6-04. Après les scénarios qui modifient une information, remettre la valeur d'origine.

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US6-01 | US6 | 1. Sur la page « Mon compte », modifier l'adresse. 2. Cliquer sur « Enregistrer les modifications ». 3. Dans phpMyAdmin, afficher la ligne du membre dans `users`. | Le message « Vos informations ont été mises à jour. » s'affiche ; le champ garde la nouvelle valeur ; en base, seule l'adresse a changé (mot de passe et rôle inchangés). | Adresse « Rue de l'Exemple 12 » remplacée par « Rue de l'Exemple 14 » : réponse 200, message « Vos informations ont été mises à jour. », champ à jour ; en base, seule `address` a changé, `password_hash` et `role` sont inchangés (connexion toujours possible avec le même mot de passe). Valeur d'origine remise ensuite. | OK |
| TF-US6-02 | US6 | 1. Vider le champ « Ville ». 2. Cliquer sur « Enregistrer les modifications ». | L'envoi est bloqué : le navigateur signale le champ à remplir et y place le focus ; rien n'est enregistré. | Envoi bloqué par le navigateur (« Veuillez renseigner ce champ. »), focus sur « Ville », aucune requête envoyée ; base inchangée. | OK |
| TF-US6-03 | US6 | 1. Saisir « abc » dans « Adresse e-mail » et enregistrer. 2. Saisir une adresse sans extension (par exemple `membre@exemple`) et enregistrer. | 1. Le navigateur bloque l'envoi (arobase manquante). 2. Le message « L'adresse e-mail n'est pas valide. » s'affiche, la saisie est conservée et rien n'est enregistré. | 1. « abc » : envoi bloqué par le navigateur (arobase manquante), aucune requête. 2. Adresse sans extension : réponse 400, message « L'adresse e-mail n'est pas valide. », saisie conservée ; base inchangée. | OK |
| TF-US6-04 | US6 | 1. Saisir l'e-mail d'un autre compte (`compte.test@exemple.com`). 2. Cliquer sur « Enregistrer les modifications ». | Le message « Un compte existe déjà avec cette adresse e-mail. » s'affiche ; rien n'est enregistré ; l'autre compte n'est pas modifié. | Réponse 409, message « Un compte existe déjà avec cette adresse e-mail. » ; ligne du membre inchangée en base ; un seul compte porte `compte.test@exemple.com`. | OK |
| TF-US6-05 | US6 | 1. Modifier un champ et enregistrer. 2. Recharger la page (F5). | La page « Mon compte » reste affichée avec la valeur enregistrée. | Après F5, la page « Mon compte » affiche « Rue de l'Exemple 14 », valeur enregistrée au scénario TF-US6-01. | OK |
| TF-US6-06 | US6 | 1. Modifier le prénom et enregistrer. 2. Observer l'en-tête. 3. Recharger la page (F5). | « Bienvenue, [nouveau prénom] » s'affiche aussitôt, sans rechargement, et reste affiché après F5. | Prénom « Camille-Anne » : « Bienvenue, Camille-Anne » aussitôt après l'enregistrement, et toujours après F5. Prénom d'origine remis : « Bienvenue, Camille ». | OK |
| TF-US6-07 | US6 | 1. Se déconnecter. 2. Saisir directement http://localhost:5173/mon-compte. 3. Dans la console du navigateur, envoyer une requête `PUT` vers `/api/auth/me` sans être connecté. | Le visiteur est redirigé vers l'accueil, le modal de connexion s'ouvre et aucun formulaire n'est affiché ; la requête est refusée (401, « Non connecté. »). | Redirection vers l'accueil avec le modal de connexion, aucun formulaire affiché ; requête sans session refusée : 401 `{"message":"Non connecté."}`. | OK |

## US7 — Déconnexion et page Mon compte

Prérequis : être connecté avec le compte de test (voir US4). Pour les scénarios d'accès visiteur, utiliser un navigateur non connecté ou se déconnecter d'abord.

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US7-01 | US7 | 1. Se connecter. 2. Cliquer sur l'icône « Mon compte ». | Un petit panneau s'ouvre sous l'icône avec deux options, dans cet ordre : « Paramètres » puis « Se déconnecter » ; le focus est sur « Paramètres ». | Exécuté avec le compte camille.martin@exemple.be : panneau ouvert avec « Paramètres » puis « Se déconnecter » ; focus sur « Paramètres ». | OK |
| TF-US7-02 | US7 | 1. Ouvrir le panneau. 2. Appuyer sur Tab, puis sur Maj+Tab. | Le focus passe de « Paramètres » à « Se déconnecter » et inversement, avec un contour visible ; les flèches du clavier ne sont pas nécessaires. | Tab : « Se déconnecter » ; Maj+Tab : « Paramètres » ; contour visible sur les deux. | OK |
| TF-US7-03 | US7 | 1. Ouvrir le panneau. 2. Appuyer sur Échap. | Le panneau se ferme et le focus revient sur l'icône « Mon compte ». | Panneau fermé, focus sur « Mon compte ». | OK |
| TF-US7-04 | US7 | 1. Ouvrir le panneau. 2. Cliquer dans une zone vide de la page, en dehors du panneau. | Le panneau se ferme ; le focus n'est pas ramené de force sur l'icône. | Panneau fermé ; le focus n'est pas sur l'icône (il reste sur la page). | OK |
| TF-US7-05 | US7 | 1. Ouvrir le panneau. 2. Cliquer de nouveau sur l'icône « Mon compte ». | Le panneau se ferme. | Le second clic ferme le panneau. | OK |
| TF-US7-06 | US7 | 1. Ouvrir le panneau. 2. Cliquer sur « Paramètres ». | La page « Mon compte » s'affiche à l'adresse /mon-compte, le panneau est fermé et le focus est revenu sur l'icône. | Page /mon-compte affichée, panneau fermé, focus sur « Mon compte ». | OK |
| TF-US7-07 | US7 | 1. Ouvrir la page « Mon compte » en tant que membre. | Le titre « Mon compte » est affiché avec le formulaire « Vos informations personnelles » : six champs préremplis avec les informations du membre (Prénom, Nom, Adresse e-mail, Adresse, Code postal, Ville) et un bouton « Enregistrer les modifications » ; le mot de passe n'est pas affiché. | Titre « Mon compte » ; formulaire avec les six champs préremplis (Camille, Martin, camille.martin@exemple.be, Rue de l'Exemple 12, 1000, Bruxelles), modifiables, et le bouton « Enregistrer les modifications » ; aucun champ de mot de passe. | OK |
| TF-US7-08 | US7 | 1. Se déconnecter. 2. Saisir directement http://localhost:5173/mon-compte dans la barre d'adresse. | Le visiteur est redirigé vers l'accueil et le modal de connexion s'ouvre. Après fermeture du modal puis rechargement (F5), le modal ne se rouvre pas. | Redirection vers l'accueil avec le modal de connexion ; après fermeture (Échap) et F5, le modal ne se rouvre pas. | OK |
| TF-US7-09 | US7 | 1. Se connecter. 2. Ouvrir la page « Mon compte ». 3. Recharger la page (F5). | La page « Mon compte » reste affichée (pas de redirection) avec les informations du membre. | Après F5, /mon-compte reste affichée avec les informations du membre (prénom « Camille »). | OK |
| TF-US7-10 | US7 | 1. Se connecter. 2. Sur l'accueil, ouvrir une fiche produit (catégorie puis « Voir le produit »), puis fermer la fiche. 3. Ouvrir le panneau et cliquer sur « Se déconnecter ». 4. Se reconnecter, aller sur « Qui sommes-nous » et se déconnecter de la même façon. | Fermer la fiche produit, puis se déconnecter depuis l'en-tête : le visiteur reste sur la page. Sur chaque page, « Bienvenue, [prénom] » disparaît et le panneau se ferme. | Accueil, fiche « Robe d'été » ouverte puis fermée : après la déconnexion, le visiteur reste sur l'accueil, à la même position (liste « Femmes », 4 produits), « Bienvenue » a disparu et le panneau est fermé. « Qui sommes-nous » : le visiteur reste sur /about, « Bienvenue » a disparu, panneau fermé. | OK |
| TF-US7-11 | US7 | 1. Se connecter. 2. Ouvrir la page « Mon compte ». 3. Ouvrir le panneau et cliquer sur « Se déconnecter ». | Le visiteur est ramené à l'accueil ; « Bienvenue » a disparu et le modal de connexion ne s'ouvre pas de lui-même. | Retour à l'accueil, plus de « Bienvenue », aucun modal ouvert. | OK |
| TF-US7-12 | US7 | 1. Se déconnecter. 2. Cliquer sur l'icône « Mon compte ». | Le modal de connexion s'ouvre (comportement d'un visiteur) ; il n'y a pas de panneau. | Le modal « Connexion » s'ouvre ; aucun panneau. | OK |
| TF-US7-13 | US7 | 1. Se connecter. 2. Se déconnecter. 3. Recharger la page (F5). | Le visiteur reste déconnecté : aucun « Bienvenue ». Dans les outils de développement (F12, onglet Réseau), la requête « logout » répond 204 et un appel à « me » répond 401. | « logout » répond 204 ; après F5, « me » répond 401 ; aucun « Bienvenue ». | OK |
| TF-US7-14 | US7 | 1. Se connecter. 2. Arrêter le back. 3. Ouvrir le panneau et cliquer sur « Se déconnecter ». | Le message « Déconnexion impossible pour le moment. Veuillez réessayer plus tard. » s'affiche dans le panneau, qui reste ouvert ; le membre reste connecté (« Bienvenue » toujours visible). | Message « Déconnexion impossible pour le moment. Veuillez réessayer plus tard. » dans le panneau, qui reste ouvert ; « Bienvenue, Camille » toujours visible. | OK |
| TF-US7-15 | US7 | 1. Activer un lecteur d'écran (ou observer l'arbre d'accessibilité). 2. Examiner l'icône « Mon compte » connecté, puis provoquer l'échec de déconnexion du scénario précédent. | L'icône est annoncée comme bouton replié ou déplié, relié au panneau ; le panneau est une simple liste (pas de menu à flèches) ; le message d'erreur est annoncé sans que le focus quitte le panneau. | Bouton avec aria-expanded (« false » replié, « true » déplié) et aria-controls vers le panneau ; panneau en simple liste, sans rôle menu ; message d'erreur dans une zone d'alerte (role="alert"), focus resté dans le panneau. | OK |
| TF-US7-16 | US7 | 1. Se déconnecter. 2. Examiner l'icône « Mon compte » à l'aide d'un lecteur d'écran (ou de l'arbre d'accessibilité). | L'icône annonce l'ouverture d'une fenêtre de dialogue (connexion) et n'indique pas d'état replié ou déplié. | Bouton avec aria-haspopup="dialog", sans aria-expanded ni aria-controls. | OK |

## Obligations légales — pages légales

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TL-01 | Légal | 1. En bas de page, cliquer sur « Mentions légales ». | La page /mentions-legales s'affiche sans rechargement : éditeur, adresse, e-mail, numéro d'entreprise, hébergeur. | /mentions-legales s'affiche sans rechargement avec l'éditeur, l'adresse, l'e-mail, le téléphone, le numéro d'entreprise, la TVA et l'hébergeur. | OK |
| TL-02 | Légal | 1. Cliquer sur « Conditions générales de vente ». | La page /cgv s'affiche sans rechargement : prix TTC en euros, commande, paiement, livraison, rétractation 14 jours, garantie légale 2 ans, retours, litiges. | /cgv s'affiche sans rechargement avec les 10 rubriques : vendeur, prix, commande, paiement, livraison, rétractation 14 jours, retours, garantie 2 ans, données personnelles, litiges. | OK |
| TL-03 | Légal | 1. Cliquer sur « Confidentialité ». | La page /confidentialite s'affiche sans rechargement : responsable, données, finalité, base légale, durée, droits, contact, plainte auprès de l'APD. | /confidentialite s'affiche sans rechargement avec les 9 rubriques : responsable, données, finalité, base légale, durée, destinataires, droits, réclamation, cookies. | OK |
| TL-04 | Légal | 1. Cliquer sur « Cookies ». | La page /cookies s'affiche sans rechargement et décrit le stockage utilisé (sera-cookie-consent) et son rôle. | /cookies s'affiche sans rechargement ; le tableau décrit « sera-cookie-consent » (stockage local, mémorisation du choix). | OK |
| TL-05 | Légal | 1. Ouvrir chaque page légale. 2. Comparer avec le reste du site (polices, couleurs, espacements). | Le style est cohérent avec le reste du site. La date de dernière mise à jour est visible sous le titre. | Les 4 pages légales partagent Jost et le même gabarit (titre 34 px, texte 15 px) ; « Qui sommes-nous » est aussi en Jost ; « Dernière mise à jour : octobre 2026. » est visible sous le titre des 4 pages légales. | OK |
| TL-06 | Légal | 1. Depuis une page légale, cliquer sur les liens internes (ex. « politique cookies »). 2. Utiliser le bouton Précédent du navigateur. | La navigation se fait sans rechargement et le retour arrière fonctionne. | Lien « mentions légales » depuis /cgv : page ouverte sans rechargement ; Précédent ramène à /cgv sans rechargement. | OK |
| TL-07 | Légal | 1. Comparer l'éditeur (nom, adresse, e-mail, téléphone, BCE, TVA) entre les mentions légales, les CGV, la confidentialité, la page cookies et le footer. | Les informations sont identiques partout. Aucune information manquante ou provisoire n'est visible. | Nom, adresse, e-mail, téléphone, BCE et TVA identiques dans le pied de page, les mentions, la confidentialité et les cookies ; les CGV ne reprennent ni téléphone ni TVA. Aucun texte provisoire. | OK |

## Navigation — retour en haut de page

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TS-01 | Navigation | 1. Descendre tout en bas de l'accueil. 2. Cliquer sur « Mentions légales » dans le footer. | La page s'affiche en haut, sans rechargement ni défilement visible. | Page affichée à 0 px dès le changement de page, sans défilement animé ni rechargement. | OK |
| TS-02 | Navigation | 1. Répéter avec « Conditions générales de vente », « Confidentialité », « Cookies » puis « Qui sommes-nous ». | Chaque page s'affiche en haut. | CGV, Confidentialité, Cookies et Qui sommes-nous s'affichent chacune à 0 px, sans rechargement. | OK |
| TS-03 | Navigation | 1. Ouvrir « Mentions légales » et descendre. 2. Cliquer sur une catégorie dans l'en-tête. | On revient à l'accueil puis la page descend jusqu'à la liste des produits de la catégorie (pas en haut). | Retour à l'accueil sans rechargement ; la page descend jusqu'à la liste « Femmes » : la section des produits commence juste sous l'en-tête (56 px), comme avec un clic depuis l'accueil. | OK |
| TS-04 | Navigation | 1. Sur l'accueil, cliquer sur une catégorie. | La page descend jusqu'aux produits (comportement inchangé). | La page descend jusqu'à la liste « Hommes », dont la section commence juste sous l'en-tête (56 px). | OK |
| TS-05 | Navigation | 1. Ouvrir l'adresse `/#produits` dans le navigateur (ou depuis un lien interne). | La page n'est pas forcée en haut. | Ouverte directement, l'adresse /#produits descend jusqu'aux produits, section calée sous l'en-tête (56 px) ; même résultat avec le bouton « Découvrir la collection ». | OK |
| TS-06 | Navigation | 1. Ouvrir une page légale puis cliquer sur Précédent. | La navigation fonctionne sans rechargement et la page affichée est en haut. | Retour à l'accueil sans rechargement, page affichée en haut (0 px), en partant du bas de l'accueil. | OK |

## Obligations légales — bandeau de consentement aux cookies

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TC-01 | RGPD | 1. Vider les données du site (F12 → Application → Local Storage). 2. Recharger la page d'accueil. | Le bandeau s'affiche avec « Accepter », « Refuser » (même style) et un lien « En savoir plus » vers /cookies. | Stockage vide : le bandeau s'affiche avec « Refuser » et « Accepter » de même style (fond noir, texte blanc, 13 px) et le lien « En savoir plus » vers /cookies. | OK |
| TC-02 | RGPD | 1. Cliquer sur « Accepter ». 2. Recharger la page. | Le bandeau disparaît et ne réapparaît pas. `sera-cookie-consent` = `accepted` dans le Local Storage. | Après « Accepter » et un rechargement, le bandeau reste absent ; « sera-cookie-consent » vaut « accepted ». | OK |
| TC-03 | RGPD | 1. Vider le Local Storage. 2. Cliquer sur « Refuser ». 3. Recharger la page. | Le bandeau disparaît et ne réapparaît pas. `sera-cookie-consent` = `refused`. | Après « Refuser » et un rechargement, le bandeau reste absent ; « sera-cookie-consent » vaut « refused ». | OK |
| TC-04 | RGPD | 1. Avec un choix déjà fait, cliquer sur « Gérer les cookies » dans le footer. | Le bandeau réapparaît, sans rechargement de la page. | Le clic sur « Gérer les cookies » affiche le bandeau, sans rechargement ; l'URL reste « / ». | OK |
| TC-05 | RGPD | 1. Réafficher le bandeau. 2. Changer de choix (Accepter → Refuser). | Le nouveau choix remplace l'ancien dans le Local Storage. | « accepted » remplacé par « refused », puis de nouveau par « accepted ». | OK |
| TC-06 | RGPD | 1. Vider le Local Storage. 2. Ouvrir l'onglet Réseau (F12), recharger la page avant tout choix. | Aucune requête vers un cookie tiers ni vers un service externe de suivi. | Au chargement sans choix, toutes les requêtes visent le site et l'API locale (localhost:5173 et localhost:8080), aucun domaine externe ; aucun cookie déposé. | OK |

## Obligations légales — newsletter

Prérequis : script `database/newsletter.sql` exécuté dans phpMyAdmin.

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TN-01 | RGPD | 1. Aller au formulaire de newsletter du footer. | La case de consentement est visible, **non cochée**, avec un lien vers /confidentialite. | Case de consentement visible, non cochée, avec le lien « politique de confidentialité » vers /confidentialite. | OK |
| TN-02 | RGPD | 1. Saisir un e-mail valide. 2. Ne pas cocher la case. 3. Cliquer sur « S'inscrire ». | Aucune inscription ; message d'erreur demandant de cocher la case. | Message « Veuillez cocher la case de consentement pour vous inscrire. » ; aucune requête d'inscription envoyée. | OK |
| TN-03 | RGPD | 1. Saisir un e-mail valide. 2. Cocher la case. 3. Cliquer sur « S'inscrire ». | Message de succès, champs réinitialisés, pas de rechargement. Ligne créée dans `newsletter_subscribers` avec `consent_date`. | Avec camille.martin@exemple.be : message « Merci, votre inscription est enregistrée. » (réponse 201), champ e-mail vidé, case décochée, sans rechargement ; ligne créée en base avec sa `consent_date`. | OK |
| TN-04 | RGPD | 1. Saisir l'e-mail déjà inscrit (même en majuscules). 2. Cocher la case. 3. Valider. | Message clair « Cette adresse e-mail est déjà inscrite. » ; aucun doublon en base. | Adresse saisie en majuscules : message « Cette adresse e-mail est déjà inscrite. » (réponse 409) ; une seule ligne en base pour cette adresse. | OK |
| TN-05 | RGPD | 1. Saisir un texte sans @ (ex. « abc »). 2. Cocher la case. 3. Valider. | Le navigateur ou le serveur refuse la saisie avec un message ; aucune inscription. | Le navigateur bloque l'envoi et signale l'absence de « @ » dans l'adresse ; aucune requête envoyée. | OK |
| TN-06 | RGPD | 1. Arrêter le back. 2. Tenter une inscription valide. | Message d'erreur générique, sans plantage de la page. | Message « Une erreur est survenue, veuillez réessayer plus tard. » ; la page reste intacte et la saisie est conservée. | OK |
| TN-07 | RGPD | 1. Cliquer sur le lien « politique de confidentialité » de la case de consentement. | La page /confidentialite s'affiche. | Le clic sur le lien ouvre /confidentialite (« Politique de confidentialité ») sans rechargement. | OK |

## Obligations légales — polices locales

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TP-01 | RGPD | 1. Ouvrir F12 → Réseau, recharger la page. 2. Filtrer sur « fonts ». | Aucune requête vers fonts.googleapis.com ni fonts.gstatic.com ; les polices viennent du site (fichiers .woff2 locaux). | Aucune requête vers fonts.googleapis.com ni fonts.gstatic.com ; 6 fichiers .woff2 servis par le site (Jost 300 à 700, Mr Dafoe 400). | OK |
| TP-02 | RGPD | 1. Comparer le logo « Sera » (Mr Dafoe) et les textes (Jost) avec la version précédente. | L'apparence est identique. | Logo en Mr Dafoe et textes en Jost, chargés et appliqués ; mêmes polices et mêmes fichiers qu'à l'exécution précédente. | OK |

## Tests d'accessibilité

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TA-01 | US1-US3 | 1. Ouvrir la page d'accueil dans Chrome. 2. Outils de développement (F12) → onglet Lighthouse. 3. Cocher uniquement « Accessibilité », choisir « Ordinateur », cliquer sur « Analyser le chargement de la page ». | Score d'accessibilité ≥ 90, sans erreur bloquante non justifiée. Noter le score et les points signalés. | Score d'accessibilité de 100/100 ; aucun point signalé. Page « Mon compte » (connecté) : 100/100 également. | OK |
| TA-02 | US1 | 1. Sur la page d'accueil, appuyer sur Tab pour parcourir la page. 2. Atteindre une catégorie et appuyer sur Entrée. | Tous les éléments interactifs reçoivent le focus dans un ordre logique, avec un focus visible. Entrée sur une catégorie affiche ses produits. | Ordre du focus : logo, 5 catégories, 4 icônes, « Découvrir », cartes « Nos univers », « Voir le produit » ; contour de focus visible partout ; Entrée sur « Femmes » affiche ses 4 produits. | OK |
| TA-03 | US2 | 1. Après avoir choisi une catégorie, naviguer avec Tab jusqu'à « Voir le produit ». 2. Appuyer sur Entrée. | Le bouton est atteignable au clavier et Entrée ouvre la fiche du produit. | « Voir le produit » est atteint au clavier après les boutons de filtre ; Entrée ouvre la fiche « Robe d'été ». | OK |
| TA-04 | US3 | 1. Ouvrir une fiche produit. 2. Appuyer sur Tab pour parcourir le modal. 3. Appuyer sur Échap. | Les contrôles du modal (tailles, Fermer) sont atteignables au clavier et le focus ne sort pas du modal : après le dernier contrôle, Tab revient au premier, et Maj+Tab fait le chemin inverse. Échap ferme le modal. | Entrée sur « Voir le produit » place le focus dans la fenêtre ; Tab : Fermer, XS, S, M, L, puis retour sur Fermer ; Maj+Tab : de Fermer à L, M, S, XS, puis Fermer ; le focus ne sort jamais de la fenêtre et la page ne défile pas ; Échap ferme le modal. | OK |
| TA-05 | US3 | 1. Fermer le modal avec Échap. 2. Observer l'élément qui a le focus. | Le focus reste utilisable (il n'est pas perdu dans une zone masquée) et on peut continuer à naviguer avec Tab. | Après Échap, le focus revient sur le bouton « Voir le produit » d'origine, le défilement de la page est rétabli et Tab continue depuis ce bouton ; même retour après fermeture par ✕ ou par un clic sur le fond. | OK |
| TA-06 | US2-US3 | 1. Inspecter les images de la page (miniatures, modal, univers, bannières). 2. Vérifier l'attribut `alt` de chacune. | Chaque image porteuse d'information a un texte alternatif pertinent (ex. nom du produit). Les images purement décoratives ont `alt=""`. | Miniatures et fiche : alt = nom du produit ; bannière : alt descriptif ; images « Nos univers » : alt vide ; les 11 icônes SVG sont masquées aux lecteurs d'écran. | OK |
| TA-07 | US1-US3 | 1. Dans les outils de développement, inspecter un texte (prix, nom, boutons, messages). 2. Lire le ratio de contraste dans le sélecteur de couleur. | Ratio ≥ 4,5:1 pour le texte normal et ≥ 3:1 pour le grand texte (WCAG AA). Vérifier aussi le texte sur les images et vidéos. | Conforme : « Collection d'automne » à 5,63:1, prix à 18,88:1, « Bienvenue, [prénom] » à 21:1 ; sur « Nos univers », titres au moins à 7,46:1 (seuil 3:1) et « Voir la collection » au moins à 9,29:1 (seuil 4,5:1) ; texte de la vidéo d'accueil au moins à 5,49:1 ; aucun contraste signalé à l'audit. | OK |

## Historique des exécutions

### 1re exécution — 2 novembre 2026 : 44 OK / 3 KO

| ID | Écart constaté |
|----|----------------|
| TS-05 | L'adresse /#produits ouverte directement restait en haut de page : l'ancre n'existait pas encore au moment où le navigateur la cherchait. |
| TS-06 | Après « Précédent » depuis une page légale, l'accueil s'affichait à 1 973 px du haut au lieu d'être en haut. |
| TA-07 | Contrastes insuffisants : « Collection d'automne » (4,49:1) et, sur les cartes « Nos univers », les titres et « Voir la collection » sur photo. |

Limites relevées, scénarios déclarés OK : TS-03 (titre de la liste à 477 px du haut au lieu de 56 px), TA-04 et TA-05 (focus non géré à l'ouverture et à la fermeture de la fiche produit), absence de description pour les moteurs de recherche.

### Défauts corrigés

- **TS-05** : l'accueil descend lui-même jusqu'aux produits lorsque l'adresse contient #produits, une fois la section « Nos univers » chargée.
- **TS-06** : le navigateur ne restaure plus l'ancienne position de défilement ; chaque page s'ouvre en haut.
- **TA-07** : dégradé sombre renforcé sous le texte des cartes « Nos univers » et gris plus foncé pour « Collection d'automne ».
- **TS-03** : le défilement vers la liste attend la fin du chargement de « Nos univers », qui déplaçait la liste en s'affichant.
- **TA-04 / TA-05** : à l'ouverture de la fiche produit, le focus entre dans la fenêtre ; à la fermeture, il revient sur le bouton « Voir le produit » d'origine.
- Ajout d'une description en français dans la page d'accueil pour les moteurs de recherche.

### 2e exécution — 2 novembre 2026 : 47 OK / 0 KO

Scénarios rejoués : TS-03, TS-05, TS-06, TA-01, TA-04, TA-05 et TA-07. Contrôle de non-régression : TS-01, TS-02, TS-04 et fermeture de la fiche produit (position de la page inchangée). Les autres scénarios n'ont pas été modifiés par les corrections et ne sont pas rejoués.

Limite connue : le focus n'est pas piégé dans la fiche produit ; après le dernier contrôle de la fenêtre, Tab passe à la suite de la page.

### 3e exécution — 25 novembre 2026 : 94 OK / 4 KO

Fin du sprint 2. Tous les scénarios du cahier sont exécutés : les 47 scénarios du sprint 1 (contrôle de non-régression) et les 51 scénarios de connexion (TF-US4), d'inscription (TF-US5), de modification des informations (TF-US6, ajoutés pour cette exécution) et de déconnexion (TF-US7). Les scénarios « back arrêté » sont exécutés en coupant l'accès du navigateur à l'API. Les scénarios prévus avec le compte de test (TF-US4, TF-US7) sont exécutés avec le compte camille.martin@exemple.be, créé par l'inscription au scénario TF-US5-03. Aucune régression sur les scénarios du sprint 1.

| ID | Écart constaté |
|----|----------------|
| TF-US4-12 | La réponse de la connexion contient, en plus du prénom, du nom et de l'e-mail, l'adresse, le code postal et la ville du membre. Ni mot de passe ni empreinte. |
| TF-US5-13 | Même constat pour la réponse de l'inscription (code 201). L'empreinte BCrypt et l'e-mail en minuscules sont conformes en base. |
| TF-US7-07 | La page « Mon compte » n'est plus en lecture seule : elle affiche le formulaire de modification ajouté par l'US6. Le résultat attendu du scénario est antérieur à l'US6. |
| TF-US7-10 | Fiche produit ouverte : le fond sombre recouvre l'en-tête, l'icône « Mon compte » ne peut pas être cliquée. Elle reste atteignable au clavier, car le focus n'est pas piégé dans la fiche (TA-04) ; la déconnexion fonctionne alors et la fiche reste ouverte. Sur l'accueil et « Qui sommes-nous », la déconnexion est conforme. |

Remarque, scénario déclaré OK : TF-US4-11 (le lien « Créer un compte », ajouté avec l'inscription, fait partie du cycle du focus dans la fenêtre de connexion ; le focus ne sort jamais de la fenêtre).

Audit Lighthouse (mode « Ordinateur »), scores Performance / Accessibilité / Bonnes pratiques / SEO :

| Page | Performance | Accessibilité | Bonnes pratiques | SEO |
|------|-------------|---------------|------------------|-----|
| Accueil | 99 | 100 | 96 | 92 |
| Mon compte (connecté) | 81 | 100 | 100 | 91 |

Points signalés : sur l'accueil, une erreur dans la console (réponse 401 de « me » pour un visiteur non connecté) ; sur les deux pages, fichier `robots.txt` invalide (le serveur de développement renvoie la page d'accueil à sa place) et page non éligible au cache de navigation arrière.

### Corrections

**Scénarios mis à jour suite à l'US6.** L'US6 (modification des informations personnelles) a volontairement changé deux comportements. Le « Résultat attendu » de trois scénarios, rédigé avant l'US6, a été mis à jour :

- **TF-US4-12** et **TF-US5-13** : les réponses de la connexion et de l'inscription renvoient désormais l'adresse, le code postal et la ville en plus du prénom, du nom et de l'e-mail, car la page « Mon compte » affiche et modifie ces informations. L'exigence de sécurité est conservée : jamais de mot de passe ni d'empreinte dans la réponse.
- **TF-US7-07** : la page « Mon compte » n'est plus en lecture seule ; elle présente le formulaire des six informations personnelles et le bouton « Enregistrer les modifications ».

**Scénario reformulé.** **TF-US7-10** : une fiche produit ouverte bloque l'arrière-plan, comme toute fenêtre de dialogue ; ce n'est pas un défaut. Le scénario consiste désormais à fermer la fiche produit, puis à se déconnecter depuis l'en-tête.

**Défaut corrigé dans la fiche produit.** Le vrai défaut relevé par TF-US7-10 est la limite connue de TA-04 : le focus n'était pas piégé dans la fiche, et Tab permettait d'atteindre la page masquée derrière elle. La fiche produit utilise désormais le même comportement que les fenêtres de connexion et d'inscription : focus dans la fenêtre à l'ouverture, Tab et Maj+Tab bouclent sur ses contrôles, Échap la ferme, le défilement de la page est bloqué pendant l'ouverture et le focus revient sur le bouton « Voir le produit » d'origine à la fermeture. Ce comportement commun a aussi été complété : lorsque la fenêtre elle-même a le focus (à l'ouverture de la fiche, ou après un clic sur son fond), Tab va au premier contrôle et Maj+Tab au dernier, au lieu de sortir de la fenêtre. L'apparence de la fiche est inchangée.

### 4e exécution — 25 novembre 2026 : 98 OK / 0 KO

Scénarios rejoués après les corrections : TF-US4-12, TF-US5-13 (avec une nouvelle inscription de camille.martin@exemple.be), TF-US7-07, TF-US7-10, TF-US3-01 à TF-US3-04, TA-04 et TA-05. Tous sont OK. Les autres scénarios ne sont pas concernés par les corrections et gardent le résultat de la 3e exécution. Plus aucune limite connue.
