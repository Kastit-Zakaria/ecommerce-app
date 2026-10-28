# Cahier de tests fonctionnels (manuels)

Prérequis : MySQL (XAMPP) démarré, back lancé (`./mvnw spring-boot:run`), front lancé (`npm run dev`), page d'accueil ouverte dans le navigateur.
Les colonnes « Résultat obtenu » et « Statut » (OK / KO) sont à remplir lors de l'exécution.

## US1 — Liste des catégories

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US1-01 | US1 | 1. Ouvrir la page d'accueil. | La liste des catégories est visible (navigation et section « Nos univers »). | | |
| TF-US1-02 | US1 | 1. Ouvrir la page d'accueil. 2. Comparer avec les catégories en base. | Toutes les catégories de la base sont affichées, avec leur nom. | | |
| TF-US1-03 | US1 | 1. Arrêter le back. 2. Recharger la page d'accueil. | La page s'affiche sans plantage (aucune catégorie affichée, erreur seulement dans la console). | | |

## US2 — Produits d'une catégorie

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US2-01 | US2 | 1. Cliquer sur une catégorie contenant des produits. | Les produits de la catégorie s'affichent en miniatures (image + prix) avec le nom de la catégorie en titre. | | |
| TF-US2-02 | US2 | 1. Cliquer sur une catégorie. 2. Survoler une miniature avec la souris. | Le nom du produit apparaît en infobulle. | | |
| TF-US2-03 | US2 | 1. Cliquer sur une catégorie sans produit. | Le message « Aucun produit dans cette catégorie. » s'affiche. | | |
| TF-US2-04 | US2 | 1. Cliquer sur une catégorie. 2. Observer l'onglet du navigateur (icône de chargement) et la position de la page. | La page ne se recharge pas : seule la zone produits est mise à jour. | | |
| TF-US2-05 | US2 | 1. Cliquer sur une catégorie A, puis sur une catégorie B. | Les produits de B remplacent ceux de A, sans rechargement de la page. | | |

## US3 — Détail d'un produit

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TF-US3-01 | US3 | 1. Cliquer sur « Voir le produit » d'une miniature. | Une fenêtre (modal) s'ouvre avec le nom, la marque, le prix et l'image du produit. | | |
| TF-US3-02 | US3 | 1. Ouvrir la fiche d'un produit. 2. Vérifier le prix. | Le prix est au format belge (ex. « 64,90 € »). | | |
| TF-US3-03 | US3 | 1. Ouvrir la fiche d'un produit. 2. Observer l'onglet du navigateur. | La page ne se recharge pas et l'URL ne change pas. | | |
| TF-US3-04 | US3 | 1. Ouvrir la fiche d'un produit. 2. Cliquer sur ✕ (ou en dehors de la fenêtre). | Le modal se ferme et on retrouve la liste des produits au même endroit. | | |

## Obligations légales — pages légales

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TL-01 | Légal | 1. En bas de page, cliquer sur « Mentions légales ». | La page /mentions-legales s'affiche sans rechargement : éditeur, adresse, e-mail, numéro d'entreprise, hébergeur. | | |
| TL-02 | Légal | 1. Cliquer sur « Conditions générales de vente ». | La page /cgv s'affiche sans rechargement : prix TTC en euros, commande, paiement, livraison, rétractation 14 jours, garantie légale 2 ans, retours, litiges. | | |
| TL-03 | Légal | 1. Cliquer sur « Confidentialité ». | La page /confidentialite s'affiche sans rechargement : responsable, données, finalité, base légale, durée, droits, contact, plainte auprès de l'APD. | | |
| TL-04 | Légal | 1. Cliquer sur « Cookies ». | La page /cookies s'affiche sans rechargement et décrit le stockage utilisé (sera-cookie-consent) et son rôle. | | |
| TL-05 | Légal | 1. Ouvrir chaque page légale. 2. Comparer avec le reste du site (polices, couleurs, espacements). | Le style est cohérent avec le reste du site. La date de dernière mise à jour est visible sous le titre. | | |
| TL-06 | Légal | 1. Depuis une page légale, cliquer sur les liens internes (ex. « politique cookies »). 2. Utiliser le bouton Précédent du navigateur. | La navigation se fait sans rechargement et le retour arrière fonctionne. | | |
| TL-07 | Légal | 1. Comparer l'éditeur (nom, adresse, e-mail, téléphone, BCE, TVA) entre les mentions légales, les CGV, la confidentialité, la page cookies et le footer. | Les informations sont identiques partout. Aucune information manquante ou provisoire n'est visible. | | |

## Navigation — retour en haut de page

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TS-01 | Navigation | 1. Descendre tout en bas de l'accueil. 2. Cliquer sur « Mentions légales » dans le footer. | La page s'affiche en haut, sans rechargement ni défilement visible. | | |
| TS-02 | Navigation | 1. Répéter avec « Conditions générales de vente », « Confidentialité », « Cookies » puis « Qui sommes-nous ». | Chaque page s'affiche en haut. | | |
| TS-03 | Navigation | 1. Ouvrir « Mentions légales » et descendre. 2. Cliquer sur une catégorie dans l'en-tête. | On revient à l'accueil puis la page descend jusqu'à la liste des produits de la catégorie (pas en haut). | | |
| TS-04 | Navigation | 1. Sur l'accueil, cliquer sur une catégorie. | La page descend jusqu'aux produits (comportement inchangé). | | |
| TS-05 | Navigation | 1. Ouvrir l'adresse `/#produits` dans le navigateur (ou depuis un lien interne). | La page n'est pas forcée en haut. | | |
| TS-06 | Navigation | 1. Ouvrir une page légale puis cliquer sur Précédent. | La navigation fonctionne sans rechargement et la page affichée est en haut. | | |

## Obligations légales — bandeau de consentement aux cookies

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TC-01 | RGPD | 1. Vider les données du site (F12 → Application → Local Storage). 2. Recharger la page d'accueil. | Le bandeau s'affiche avec « Accepter », « Refuser » (même style) et un lien « En savoir plus » vers /cookies. | | |
| TC-02 | RGPD | 1. Cliquer sur « Accepter ». 2. Recharger la page. | Le bandeau disparaît et ne réapparaît pas. `sera-cookie-consent` = `accepted` dans le Local Storage. | | |
| TC-03 | RGPD | 1. Vider le Local Storage. 2. Cliquer sur « Refuser ». 3. Recharger la page. | Le bandeau disparaît et ne réapparaît pas. `sera-cookie-consent` = `refused`. | | |
| TC-04 | RGPD | 1. Avec un choix déjà fait, cliquer sur « Gérer les cookies » dans le footer. | Le bandeau réapparaît, sans rechargement de la page. | | |
| TC-05 | RGPD | 1. Réafficher le bandeau. 2. Changer de choix (Accepter → Refuser). | Le nouveau choix remplace l'ancien dans le Local Storage. | | |
| TC-06 | RGPD | 1. Vider le Local Storage. 2. Ouvrir l'onglet Réseau (F12), recharger la page avant tout choix. | Aucune requête vers un cookie tiers ni vers un service externe de suivi. | | |

## Obligations légales — newsletter

Prérequis : script `database/newsletter.sql` exécuté dans phpMyAdmin.

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TN-01 | RGPD | 1. Aller au formulaire de newsletter du footer. | La case de consentement est visible, **non cochée**, avec un lien vers /confidentialite. | | |
| TN-02 | RGPD | 1. Saisir un e-mail valide. 2. Ne pas cocher la case. 3. Cliquer sur « S'inscrire ». | Aucune inscription ; message d'erreur demandant de cocher la case. | | |
| TN-03 | RGPD | 1. Saisir un e-mail valide. 2. Cocher la case. 3. Cliquer sur « S'inscrire ». | Message de succès, champs réinitialisés, pas de rechargement. Ligne créée dans `newsletter_subscribers` avec `consent_date`. | | |
| TN-04 | RGPD | 1. Saisir l'e-mail déjà inscrit (même en majuscules). 2. Cocher la case. 3. Valider. | Message clair « Cette adresse e-mail est déjà inscrite. » ; aucun doublon en base. | | |
| TN-05 | RGPD | 1. Saisir un texte sans @ (ex. « abc »). 2. Cocher la case. 3. Valider. | Le navigateur ou le serveur refuse la saisie avec un message ; aucune inscription. | | |
| TN-06 | RGPD | 1. Arrêter le back. 2. Tenter une inscription valide. | Message d'erreur générique, sans plantage de la page. | | |
| TN-07 | RGPD | 1. Cliquer sur le lien « politique de confidentialité » de la case de consentement. | La page /confidentialite s'affiche. | | |

## Obligations légales — polices locales

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TP-01 | RGPD | 1. Ouvrir F12 → Réseau, recharger la page. 2. Filtrer sur « fonts ». | Aucune requête vers fonts.googleapis.com ni fonts.gstatic.com ; les polices viennent du site (fichiers .woff2 locaux). | | |
| TP-02 | RGPD | 1. Comparer le logo « Sera » (Mr Dafoe) et les textes (Jost) avec la version précédente. | L'apparence est identique. | | |

## Tests d'accessibilité

| ID | US | Étapes | Résultat attendu | Résultat obtenu | Statut |
|----|----|--------|------------------|-----------------|--------|
| TA-01 | US1-US3 | 1. Ouvrir la page d'accueil dans Chrome. 2. Outils de développement (F12) → onglet Lighthouse. 3. Cocher uniquement « Accessibilité », choisir « Ordinateur », cliquer sur « Analyser le chargement de la page ». | Score d'accessibilité ≥ 90, sans erreur bloquante non justifiée. Noter le score et les points signalés. | | |
| TA-02 | US1 | 1. Sur la page d'accueil, appuyer sur Tab pour parcourir la page. 2. Atteindre une catégorie et appuyer sur Entrée. | Tous les éléments interactifs reçoivent le focus dans un ordre logique, avec un focus visible. Entrée sur une catégorie affiche ses produits. | | |
| TA-03 | US2 | 1. Après avoir choisi une catégorie, naviguer avec Tab jusqu'à « Voir le produit ». 2. Appuyer sur Entrée. | Le bouton est atteignable au clavier et Entrée ouvre la fiche du produit. | | |
| TA-04 | US3 | 1. Ouvrir une fiche produit. 2. Appuyer sur Tab pour parcourir le modal. 3. Appuyer sur Échap. | Les contrôles du modal (tailles, Fermer) sont atteignables au clavier. Échap ferme le modal. | | |
| TA-05 | US3 | 1. Fermer le modal avec Échap. 2. Observer l'élément qui a le focus. | Le focus reste utilisable (il n'est pas perdu dans une zone masquée) et on peut continuer à naviguer avec Tab. | | |
| TA-06 | US2-US3 | 1. Inspecter les images de la page (miniatures, modal, univers, bannières). 2. Vérifier l'attribut `alt` de chacune. | Chaque image porteuse d'information a un texte alternatif pertinent (ex. nom du produit). Les images purement décoratives ont `alt=""`. | | |
| TA-07 | US1-US3 | 1. Dans les outils de développement, inspecter un texte (prix, nom, boutons, messages). 2. Lire le ratio de contraste dans le sélecteur de couleur. | Ratio ≥ 4,5:1 pour le texte normal et ≥ 3:1 pour le grand texte (WCAG AA). Vérifier aussi le texte sur les images et vidéos. | | |
