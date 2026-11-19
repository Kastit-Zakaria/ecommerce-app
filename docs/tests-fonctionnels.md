# Cahier de tests fonctionnels (manuels)

**Dernière exécution : 2 novembre 2026** (historique en fin de document)

- Environnement : local, Windows 11, Chromium 156.0.8078.4. Site sur http://localhost:5173, API sur http://localhost:8080, base MySQL locale.
- Résumé de la dernière exécution : **47 OK / 0 KO** sur 47 scénarios. Les 14 scénarios TF-US4-xx (connexion) ont été ajoutés depuis : à exécuter.
- Limite connue : dans la fiche produit, le focus n'est pas piégé dans la fenêtre (voir TA-04).

Prérequis : MySQL (XAMPP) démarré, back lancé (`./mvnw spring-boot:run`), front lancé (`npm run dev`), page d'accueil ouverte dans le navigateur.
Les colonnes « Résultat obtenu » et « Statut » (OK / KO) sont à remplir lors de l'exécution.

## US1 — Liste des catégories

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US1-01 | US1 | 1. Ouvrir la page d'accueil. | La liste des catégories est visible (navigation et section « Nos univers »). | La navigation affiche les 5 catégories (Hommes, Femmes, Enfants, Accessoires, Nouveautés) et la section « Nos univers » en affiche 4. | OK |
| TF-US1-02 | US1 | 1. Ouvrir la page d'accueil. 2. Comparer avec les catégories en base. | Toutes les catégories de la base sont affichées, avec leur nom. | Les 5 catégories de la base sont dans la navigation, avec leur nom ; « Nos univers » n'en montre que 4, « Nouveautés » n'ayant pas d'image. | OK |
| TF-US1-03 | US1 | 1. Arrêter le back. 2. Recharger la page d'accueil. | La page s'affiche sans plantage (aucune catégorie affichée, erreur seulement dans la console). | Page affichée sans plantage : en-tête, vidéo et pied de page présents, aucune catégorie visible ; l'erreur n'apparaît que dans la console. | OK |

## US2 — Produits d'une catégorie

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US2-01 | US2 | 1. Cliquer sur une catégorie contenant des produits. | Les produits de la catégorie s'affichent en miniatures (image + prix) avec le nom de la catégorie en titre. | Clic sur « Femmes » : titre « Femmes » et 4 miniatures, chacune avec son image et son prix. | OK |
| TF-US2-02 | US2 | 1. Cliquer sur une catégorie. 2. Survoler une miniature avec la souris. | Le nom du produit apparaît en infobulle. | Au survol de la première miniature, l'infobulle « Robe d'été » s'affiche. | OK |
| TF-US2-03 | US2 | 1. Cliquer sur une catégorie sans produit. | Le message « Aucun produit dans cette catégorie. » s'affiche. | Clic sur « Nouveautés » : le message « Aucun produit dans cette catégorie. » s'affiche, sans miniature. | OK |
| TF-US2-04 | US2 | 1. Cliquer sur une catégorie. 2. Observer l'onglet du navigateur (icône de chargement) et la position de la page. | La page ne se recharge pas : seule la zone produits est mise à jour. | Aucun rechargement (l'état de la page est conservé) et l'URL reste « / » ; la page descend jusqu'à la zone produits. | OK |
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
| TF-US4-01 | US4 | 1. Ouvrir la page d'accueil. 2. Cliquer sur l'icône « Mon compte » de l'en-tête. | Un modal « Connexion » s'ouvre avec les champs « Adresse e-mail » et « Mot de passe » ; le focus est sur le champ e-mail ; la page ne défile plus. | | |
| TF-US4-02 | US4 | 1. Ouvrir le modal de connexion. 2. Saisir l'e-mail et le mot de passe du compte de test. 3. Cliquer sur « Se connecter ». | Le modal se ferme, le visiteur reste sur la même page et l'en-tête affiche « Bienvenue, [prénom] ». | | |
| TF-US4-03 | US4 | 1. Ouvrir le modal. 2. Cliquer sur « Se connecter » sans rien saisir. | Un message indique que l'e-mail et le mot de passe sont obligatoires ; aucune connexion n'est tentée. | | |
| TF-US4-04 | US4 | 1. Ouvrir le modal. 2. Saisir l'e-mail seul, puis cliquer sur « Se connecter ». 3. Recommencer avec le mot de passe seul. | Dans les deux cas, le message « obligatoires » s'affiche et le modal reste ouvert. | | |
| TF-US4-05 | US4 | 1. Saisir l'e-mail du compte de test et un mauvais mot de passe. 2. Cliquer sur « Se connecter ». | Le message « Email ou mot de passe incorrect » s'affiche, le modal reste ouvert, le champ mot de passe est vidé et reçoit le focus. | | |
| TF-US4-06 | US4 | 1. Saisir un e-mail inconnu et un mot de passe quelconque. 2. Cliquer sur « Se connecter ». | Le même message « Email ou mot de passe incorrect » s'affiche (rien n'indique si l'e-mail ou le mot de passe est faux). | | |
| TF-US4-07 | US4 | 1. Se connecter. 2. Naviguer vers « Qui sommes-nous », « Confidentialité » et « Cookies ». | « Bienvenue, [prénom] » reste visible dans l'en-tête sur chaque page. | | |
| TF-US4-08 | US4 | 1. Se connecter. 2. Recharger la page (F5). | « Bienvenue, [prénom] » s'affiche toujours : la session est retrouvée. | | |
| TF-US4-09 | US4 | 1. Se connecter. 2. Cliquer de nouveau sur l'icône « Mon compte ». | Le modal de connexion ne s'ouvre plus. | | |
| TF-US4-10 | US4 | 1. Ouvrir le modal. 2. Fermer successivement avec la croix ✕, avec un clic sur le fond sombre, puis avec la touche Échap. | Le modal se ferme à chaque fois, la page peut de nouveau défiler et le focus revient sur l'icône « Mon compte ». | | |
| TF-US4-11 | US4 | 1. Ouvrir le modal. 2. Appuyer plusieurs fois sur Tab, puis sur Maj+Tab. | Le focus circule uniquement entre la croix, les deux champs et le bouton ; il ne sort jamais du modal. | | |
| TF-US4-12 | US4 | 1. Ouvrir le modal. 2. Saisir un mot de passe et observer le champ. 3. Dans les outils de développement (F12, onglet Réseau), observer la réponse de la connexion. | Le mot de passe est masqué à la saisie ; la réponse ne contient que le prénom, le nom et l'e-mail (ni mot de passe ni empreinte). | | |
| TF-US4-13 | US4 | 1. Arrêter le back. 2. Saisir des identifiants et cliquer sur « Se connecter ». | Un message indique que la connexion est impossible pour le moment ; la page ne plante pas. | | |
| TF-US4-14 | US4 | 1. Activer un lecteur d'écran (ou observer l'arbre d'accessibilité). 2. Provoquer une erreur de connexion. | Le message d'erreur est annoncé au lecteur d'écran sans déplacer le focus hors du formulaire ; chaque champ est annoncé avec son label. | | |

## Obligations légales — pages légales

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TL-01 | Légal | 1. En bas de page, cliquer sur « Mentions légales ». | La page /mentions-legales s'affiche sans rechargement : éditeur, adresse, e-mail, numéro d'entreprise, hébergeur. | /mentions-legales s'affiche sans rechargement avec l'éditeur, l'adresse, l'e-mail, le téléphone, le numéro d'entreprise, la TVA et l'hébergeur. | OK |
| TL-02 | Légal | 1. Cliquer sur « Conditions générales de vente ». | La page /cgv s'affiche sans rechargement : prix TTC en euros, commande, paiement, livraison, rétractation 14 jours, garantie légale 2 ans, retours, litiges. | /cgv s'affiche sans rechargement avec les 10 rubriques : vendeur, prix, commande, paiement, livraison, rétractation 14 jours, retours, garantie 2 ans, données personnelles, litiges. | OK |
| TL-03 | Légal | 1. Cliquer sur « Confidentialité ». | La page /confidentialite s'affiche sans rechargement : responsable, données, finalité, base légale, durée, droits, contact, plainte auprès de l'APD. | /confidentialite s'affiche sans rechargement avec les 9 rubriques : responsable, données, finalité, base légale, durée, destinataires, droits, réclamation, cookies. | OK |
| TL-04 | Légal | 1. Cliquer sur « Cookies ». | La page /cookies s'affiche sans rechargement et décrit le stockage utilisé (sera-cookie-consent) et son rôle. | /cookies s'affiche sans rechargement ; le tableau décrit « sera-cookie-consent » (stockage local, mémorisation du choix) et précise qu'aucun cookie de traçage n'est utilisé. | OK |
| TL-05 | Légal | 1. Ouvrir chaque page légale. 2. Comparer avec le reste du site (polices, couleurs, espacements). | Le style est cohérent avec le reste du site. La date de dernière mise à jour est visible sous le titre. | Les 4 pages légales et « Qui sommes-nous » partagent Jost, les mêmes couleurs, le même gabarit (titre 34 px, texte 15 px) ; « Dernière mise à jour : octobre 2026. » est visible sous le titre. | OK |
| TL-06 | Légal | 1. Depuis une page légale, cliquer sur les liens internes (ex. « politique cookies »). 2. Utiliser le bouton Précédent du navigateur. | La navigation se fait sans rechargement et le retour arrière fonctionne. | Lien « mentions légales » depuis /cgv : page ouverte sans rechargement ; Précédent ramène à /cgv sans rechargement. | OK |
| TL-07 | Légal | 1. Comparer l'éditeur (nom, adresse, e-mail, téléphone, BCE, TVA) entre les mentions légales, les CGV, la confidentialité, la page cookies et le footer. | Les informations sont identiques partout. Aucune information manquante ou provisoire n'est visible. | Nom, adresse, e-mail, téléphone, BCE et TVA identiques dans le pied de page, les mentions, la confidentialité et les cookies ; les CGV ne reprennent ni téléphone ni TVA. Aucun texte provisoire. | OK |

## Navigation — retour en haut de page

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TS-01 | Navigation | 1. Descendre tout en bas de l'accueil. 2. Cliquer sur « Mentions légales » dans le footer. | La page s'affiche en haut, sans rechargement ni défilement visible. | Page affichée à 0 px dès le changement de page, sans défilement animé ni rechargement. | OK |
| TS-02 | Navigation | 1. Répéter avec « Conditions générales de vente », « Confidentialité », « Cookies » puis « Qui sommes-nous ». | Chaque page s'affiche en haut. | CGV, Confidentialité, Cookies et Qui sommes-nous s'affichent chacune à 0 px, sans rechargement. | OK |
| TS-03 | Navigation | 1. Ouvrir « Mentions légales » et descendre. 2. Cliquer sur une catégorie dans l'en-tête. | On revient à l'accueil puis la page descend jusqu'à la liste des produits de la catégorie (pas en haut). | Retour à l'accueil sans rechargement ; le titre de la liste « Femmes » est calé juste sous l'en-tête (56 px), comme avec un clic depuis l'accueil. | OK |
| TS-04 | Navigation | 1. Sur l'accueil, cliquer sur une catégorie. | La page descend jusqu'aux produits (comportement inchangé). | La page descend jusqu'à la liste « Hommes », dont le titre se place juste sous l'en-tête. | OK |
| TS-05 | Navigation | 1. Ouvrir l'adresse `/#produits` dans le navigateur (ou depuis un lien interne). | La page n'est pas forcée en haut. | Ouverte directement, l'adresse /#produits descend jusqu'aux produits, titre calé sous l'en-tête (56 px) ; même résultat avec le bouton « Découvrir la collection ». | OK |
| TS-06 | Navigation | 1. Ouvrir une page légale puis cliquer sur Précédent. | La navigation fonctionne sans rechargement et la page affichée est en haut. | Retour à l'accueil sans rechargement, page affichée en haut (0 px), que l'on parte du haut ou du bas de l'accueil. | OK |

## Obligations légales — bandeau de consentement aux cookies

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TC-01 | RGPD | 1. Vider les données du site (F12 → Application → Local Storage). 2. Recharger la page d'accueil. | Le bandeau s'affiche avec « Accepter », « Refuser » (même style) et un lien « En savoir plus » vers /cookies. | Stockage vide : le bandeau s'affiche avec « Refuser » et « Accepter » de même style (fond noir, texte blanc, même taille de police) et le lien « En savoir plus » vers /cookies. | OK |
| TC-02 | RGPD | 1. Cliquer sur « Accepter ». 2. Recharger la page. | Le bandeau disparaît et ne réapparaît pas. `sera-cookie-consent` = `accepted` dans le Local Storage. | Après « Accepter » et un rechargement, le bandeau reste absent ; « sera-cookie-consent » vaut « accepted ». | OK |
| TC-03 | RGPD | 1. Vider le Local Storage. 2. Cliquer sur « Refuser ». 3. Recharger la page. | Le bandeau disparaît et ne réapparaît pas. `sera-cookie-consent` = `refused`. | Après « Refuser » et un rechargement, le bandeau reste absent ; « sera-cookie-consent » vaut « refused ». | OK |
| TC-04 | RGPD | 1. Avec un choix déjà fait, cliquer sur « Gérer les cookies » dans le footer. | Le bandeau réapparaît, sans rechargement de la page. | Le clic sur « Gérer les cookies » affiche le bandeau, sans rechargement ; l'URL reste « / ». | OK |
| TC-05 | RGPD | 1. Réafficher le bandeau. 2. Changer de choix (Accepter → Refuser). | Le nouveau choix remplace l'ancien dans le Local Storage. | « Accepter » remplacé par « Refuser » : « refused » ; puis « Refuser » remplacé par « Accepter » : « accepted ». | OK |
| TC-06 | RGPD | 1. Vider le Local Storage. 2. Ouvrir l'onglet Réseau (F12), recharger la page avant tout choix. | Aucune requête vers un cookie tiers ni vers un service externe de suivi. | Au chargement sans choix, toutes les requêtes visent le site et l'API locale, aucun domaine externe ; aucun cookie déposé. | OK |

## Obligations légales — newsletter

Prérequis : script `database/newsletter.sql` exécuté dans phpMyAdmin.

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TN-01 | RGPD | 1. Aller au formulaire de newsletter du footer. | La case de consentement est visible, **non cochée**, avec un lien vers /confidentialite. | Case de consentement visible, non cochée, avec le lien « politique de confidentialité » vers /confidentialite. | OK |
| TN-02 | RGPD | 1. Saisir un e-mail valide. 2. Ne pas cocher la case. 3. Cliquer sur « S'inscrire ». | Aucune inscription ; message d'erreur demandant de cocher la case. | Message « Veuillez cocher la case de consentement pour vous inscrire. » ; aucune requête d'inscription envoyée. | OK |
| TN-03 | RGPD | 1. Saisir un e-mail valide. 2. Cocher la case. 3. Cliquer sur « S'inscrire ». | Message de succès, champs réinitialisés, pas de rechargement. Ligne créée dans `newsletter_subscribers` avec `consent_date`. | Message « Merci, votre inscription est enregistrée. » (réponse 201), champ e-mail vidé, case décochée, sans rechargement ; ligne en base non consultée. | OK |
| TN-04 | RGPD | 1. Saisir l'e-mail déjà inscrit (même en majuscules). 2. Cocher la case. 3. Valider. | Message clair « Cette adresse e-mail est déjà inscrite. » ; aucun doublon en base. | Adresse saisie en majuscules : message « Cette adresse e-mail est déjà inscrite. » (réponse 409), doublon refusé. | OK |
| TN-05 | RGPD | 1. Saisir un texte sans @ (ex. « abc »). 2. Cocher la case. 3. Valider. | Le navigateur ou le serveur refuse la saisie avec un message ; aucune inscription. | Le navigateur bloque l'envoi et signale l'absence de « @ » dans l'adresse ; aucune requête envoyée. | OK |
| TN-06 | RGPD | 1. Arrêter le back. 2. Tenter une inscription valide. | Message d'erreur générique, sans plantage de la page. | Message « Une erreur est survenue, veuillez réessayer plus tard. » ; la page reste intacte et la saisie est conservée. | OK |
| TN-07 | RGPD | 1. Cliquer sur le lien « politique de confidentialité » de la case de consentement. | La page /confidentialite s'affiche. | Le clic sur le lien ouvre /confidentialite (« Politique de confidentialité ») sans rechargement. | OK |

## Obligations légales — polices locales

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TP-01 | RGPD | 1. Ouvrir F12 → Réseau, recharger la page. 2. Filtrer sur « fonts ». | Aucune requête vers fonts.googleapis.com ni fonts.gstatic.com ; les polices viennent du site (fichiers .woff2 locaux). | Aucune requête vers fonts.googleapis.com ni fonts.gstatic.com ; 6 fichiers .woff2 servis par le site (Jost 300 à 700, Mr Dafoe 400). | OK |
| TP-02 | RGPD | 1. Comparer le logo « Sera » (Mr Dafoe) et les textes (Jost) avec la version précédente. | L'apparence est identique. | Logo en Mr Dafoe et textes en Jost, chargés et appliqués ; comparaison avec la version précédente impossible, celle-ci n'étant plus disponible. | OK |

## Tests d'accessibilité

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TA-01 | US1-US3 | 1. Ouvrir la page d'accueil dans Chrome. 2. Outils de développement (F12) → onglet Lighthouse. 3. Cocher uniquement « Accessibilité », choisir « Ordinateur », cliquer sur « Analyser le chargement de la page ». | Score d'accessibilité ≥ 90, sans erreur bloquante non justifiée. Noter le score et les points signalés. | Score d'accessibilité de 100/100 ; aucun point signalé. | OK |
| TA-02 | US1 | 1. Sur la page d'accueil, appuyer sur Tab pour parcourir la page. 2. Atteindre une catégorie et appuyer sur Entrée. | Tous les éléments interactifs reçoivent le focus dans un ordre logique, avec un focus visible. Entrée sur une catégorie affiche ses produits. | Ordre du focus : logo, 5 catégories, 4 icônes, « Découvrir », cartes « Nos univers » ; contour de focus visible partout ; Entrée sur « Femmes » affiche ses 4 produits. | OK |
| TA-03 | US2 | 1. Après avoir choisi une catégorie, naviguer avec Tab jusqu'à « Voir le produit ». 2. Appuyer sur Entrée. | Le bouton est atteignable au clavier et Entrée ouvre la fiche du produit. | « Voir le produit » est atteint au clavier après les boutons de filtre ; Entrée ouvre la fiche « Robe d'été ». | OK |
| TA-04 | US3 | 1. Ouvrir une fiche produit. 2. Appuyer sur Tab pour parcourir le modal. 3. Appuyer sur Échap. | Les contrôles du modal (tailles, Fermer) sont atteignables au clavier. Échap ferme le modal. | Entrée sur « Voir le produit » place le focus dans la fenêtre ; Tab atteint Fermer, XS, S, M, L puis sort de la fenêtre (pas de piège du focus : limite connue) ; Échap ferme le modal. | OK |
| TA-05 | US3 | 1. Fermer le modal avec Échap. 2. Observer l'élément qui a le focus. | Le focus reste utilisable (il n'est pas perdu dans une zone masquée) et on peut continuer à naviguer avec Tab. | Après Échap, le focus revient sur le bouton « Voir le produit » d'origine et Tab continue depuis ce bouton ; même retour après fermeture par ✕ ou par un clic sur le fond. | OK |
| TA-06 | US2-US3 | 1. Inspecter les images de la page (miniatures, modal, univers, bannières). 2. Vérifier l'attribut `alt` de chacune. | Chaque image porteuse d'information a un texte alternatif pertinent (ex. nom du produit). Les images purement décoratives ont `alt=""`. | Miniatures et fiche : alt = nom du produit ; bannière : alt descriptif ; images « Nos univers » : alt vide ; les 11 icônes SVG sont masquées aux lecteurs d'écran. | OK |
| TA-07 | US1-US3 | 1. Dans les outils de développement, inspecter un texte (prix, nom, boutons, messages). 2. Lire le ratio de contraste dans le sélecteur de couleur. | Ratio ≥ 4,5:1 pour le texte normal et ≥ 3:1 pour le grand texte (WCAG AA). Vérifier aussi le texte sur les images et vidéos. | Conforme : « Collection d'automne » à 5,63:1 ; sur « Nos univers », titres au moins à 8,4:1 (seuil 3:1) et « Voir la collection » au moins à 9,6:1 (seuil 4,5:1) ; texte de la vidéo d'accueil au moins à 6,4:1 ; aucun contraste signalé à l'audit. | OK |

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
