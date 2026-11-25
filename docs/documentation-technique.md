# Documentation technique du site SERA

Ce document s'adresse au développeur qui reprend le projet. Il décrit ce qui existe dans le code à ce jour. Pour utiliser le site, voir le [guide utilisateur](guide-utilisateur.md).

## Sommaire

1. [Architecture générale](#1-architecture-générale)
2. [Technologies et versions](#2-technologies-et-versions)
3. [Structure des dossiers](#3-structure-des-dossiers)
4. [Base de données](#4-base-de-données)
5. [API REST](#5-api-rest)
6. [Routes du frontend](#6-routes-du-frontend)
7. [Flux de données : de la catégorie aux produits](#7-flux-de-données--de-la-catégorie-aux-produits)
8. [Standard de codage](#8-standard-de-codage)
9. [Tests](#9-tests)
10. [Installation en local et déploiement](#10-installation-en-local-et-déploiement)
11. [Workflow Git](#11-workflow-git)
12. [Sécurité des mots de passe](#12-sécurité-des-mots-de-passe)
13. [Flux du compte membre : inscription, modification du profil, déconnexion](#13-flux-du-compte-membre--inscription-modification-du-profil-déconnexion)

---

## 1. Architecture générale

Le site est une application à trois niveaux : une interface React qui appelle une API REST Spring Boot, laquelle lit et écrit dans une base MySQL.

```
┌──────────────────────┐   HTTP / JSON   ┌───────────────────────────┐   JDBC    ┌──────────────┐
│  Navigateur          │ ──────────────► │  Backend Spring Boot      │ ────────► │  MySQL       │
│  Frontend React/Vite │ ◄────────────── │  API REST (port 8080)     │ ◄──────── │  ecommercedb │
│  (port 5173 en dev)  │   Axios         │  controller → service →   │  JPA /    │              │
└──────────────────────┘                 │  repository → entity      │  Hibernate└──────────────┘
                                         └───────────────────────────┘
```

- Le frontend est une application à page unique. Il appelle l'API avec Axios ; l'adresse de l'API vient de la variable `VITE_API_URL`.
- Le backend expose des routes sous `/api`. Les membres sont authentifiés par session HTTP (cookie `JSESSIONID`, routes `/api/auth`) ; seule la modification du profil (`PUT /api/auth/me`) exige d'être connecté.
- Le navigateur n'appelle l'API qu'à partir de l'origine autorisée par CORS (variable `CORS_ALLOWED_ORIGIN`).
- Le schéma de la base est créé à l'avance par un script SQL. Hibernate ne fait que le **vérifier** (`spring.jpa.hibernate.ddl-auto=validate`) : il ne crée ni ne modifie aucune table.

---

## 2. Technologies et versions

Les versions sont celles de `frontend/package.json` et `backend/pom.xml`.

### Frontend (`frontend/package.json`)

| Technologie | Version | Rôle |
|-------------|---------|------|
| React / React DOM | ^19.2.8 | Interface |
| Vite | ^8.3.0 | Serveur de développement et build |
| React Router DOM | ^7.18.4 | Routes côté navigateur |
| Axios | ^1.20.0 | Appels HTTP vers l'API |
| Bootstrap | ^5.3.8 | Socle CSS |
| @fontsource/jost, @fontsource/mr-dafoe | ^5.3.0 | Polices hébergées en local (aucun appel à un serveur de polices externe) |
| Vitest | ^5.0.5 | Tests |
| Testing Library (react, jest-dom, user-event) | ^16.3.3 / ^7.0.1 / ^14.6.8 | Tests de composants |
| jsdom | ^30.1.3 | Environnement navigateur simulé pour les tests |
| oxlint | ^1.81.0 | Analyse statique (`npm run lint`) |

Le module est de type ES (`"type": "module"`).

### Backend (`backend/pom.xml`)

| Technologie | Version | Rôle |
|-------------|---------|------|
| Java | 17 (`java.version`) minimum ; JDK 21 recommandé | Langage |
| Spring Boot (parent) | 4.1.1 | Framework |
| spring-boot-starter-webmvc | (géré par Spring Boot) | API REST |
| spring-boot-starter-data-jpa | (géré par Spring Boot) | Accès aux données (JPA / Hibernate) |
| mysql-connector-j | (géré par Spring Boot) | Pilote MySQL |
| Lombok | (géré par Spring Boot) | Génération des accesseurs dans les entités |
| spring-boot-devtools | (géré par Spring Boot) | Rechargement en développement |
| H2 | (géré par Spring Boot) | Base en mémoire, **tests uniquement** |
| spring-boot-starter-data-jpa-test, spring-boot-starter-webmvc-test | (géré par Spring Boot) | Outils de test |

Maven est lancé via le wrapper `backend/mvnw` (`mvnw.cmd` sous Windows).

### Base de données

MySQL (ou MariaDB). En développement, la base est fournie par XAMPP.

---

## 3. Structure des dossiers

```
ecommerce-app/
├── backend/            API Spring Boot
├── frontend/           Application React
├── database/           Scripts SQL
├── docs/               Documentation
└── README.md           Présentation et installation
```

### Backend (`backend/src/main/java/com/ecommerce/backend/`)

```
BackendApplication.java      Point d'entrée Spring Boot
config/
  CorsConfig.java            Règles CORS (cookies autorisés)
  PasswordConfig.java        Encodeur BCrypt
controller/
  CategoryController.java    /api/categories
  ProductController.java    /api/products
  NewsletterController.java  /api/newsletter
  AuthController.java        /api/auth
service/
  CategoryService.java
  ProductService.java
  NewsletterService.java
  AuthService.java
repository/
  CategoryRepository.java
  ProductRepository.java
  NewsletterSubscriberRepository.java
  UserRepository.java
entity/
  Brand.java  Category.java  NewsletterSubscriber.java
  Product.java  ProductType.java  Size.java  User.java
```

Chaque couche a un rôle précis, et les appels vont toujours dans le même sens : `controller → service → repository → base`.

| Couche | Rôle |
|--------|------|
| `entity` | Classes mappées sur les tables (JPA). Elles servent aussi de format JSON des réponses. Les noms d'attributs des entités sont ceux de la base et ne suivent pas le préfixe du standard de codage. |
| `repository` | Interfaces Spring Data JPA : requêtes sur la base. Les requêtes sont déduites du nom de la méthode (`findByCategoryId`, `findTop8ByOrderByIdDesc`, `existsByEmail`). |
| `service` | Logique métier et règles : 404 si un produit est inconnu, validation de la newsletter (consentement, format d'e-mail, doublon), connexion, inscription et modification du profil des membres (`AuthService`). |
| `controller` | Routes HTTP : reçoit la requête, appelle le service et renvoie la réponse JSON. `NewsletterController` et `AuthController` convertissent les erreurs du service en `{ "message": "..." }`. `AuthController` gère aussi la session HTTP (ouverture, lecture, destruction) et contrôle l'en-tête `Origin` de la modification du profil. |
| `config` | Configuration : `CorsConfig` autorise l'origine du front (avec les cookies) ; `PasswordConfig` déclare l'encodeur BCrypt. |

Fichiers de configuration : `backend/src/main/resources/application.properties` (connexion MySQL, CORS, JPA) ; `backend/src/test/resources/application.properties` (H2 en mémoire pour les tests).

### Frontend (`frontend/src/`)

```
main.jsx                   Point d'entrée (monte <App />, charge les polices et styles)
App.jsx                    Composant racine : routes, état partagé
components/                Composants réutilisables (+ fichiers *.test.jsx)
context/                   Contexte React (AuthContext : membre connecté)
hooks/                     Hooks React partagés (useModalBehavior)
pages/                     Une page par route
services/                  Appels à l'API
utils/                     Fonctions utilitaires
config/                    Données de configuration
styles/                    Feuilles de style CSS
test/setup.js              Configuration commune des tests
```

| Dossier | Rôle |
|---------|------|
| `components/` | Éléments d'interface : `Header`, `CategoryList`, `Footer`, `CookieBanner`, `ProductList`, `ProductModal`, `LoginModal`, `RegisterModal`, `MemberRoute`, `HeroVideo`, `Reassurance`, `Universes`, `EditorialBanner`, `LegalPage`, `ScrollToTop`. |
| `pages/` | Assemblage des composants pour une route : `Home`, `About`, `MentionsLegales`, `Cgv`, `Confidentialite`, `Cookies`, `MonCompte`. Les pages légales s'appuient sur le composant `LegalPage`. |
| `context/` | `AuthContext.jsx` : `AuthProvider` (membre connecté `objUser`, `blChecking`, `fLogin`, `fRegister`, `fLogout`, `fRefreshProfile`, `fUpdateProfile`) ; `useAuth.js` : hook d'accès ; `authContextObject.js` : objet de contexte partagé. Au démarrage, il appelle `GET /api/auth/me` pour retrouver la session. |
| `hooks/` | `useModalBehavior.js` : comportement commun aux fenêtres de connexion, d'inscription et à la fiche produit (focus initial et retour du focus, Échap, piège de Tab, blocage du défilement de la page). |
| `services/` | `api.js` crée le client Axios partagé (adresse via `VITE_API_URL`, `http://localhost:8080/api` par défaut, `withCredentials: true` pour le cookie de session) ; `newsletter.js` envoie l'inscription. |
| `utils/` | `formatPrice.js` (prix en euros, locale `fr-BE`) ; `cookieConsent.js` (lecture et écriture du choix de cookies dans `localStorage`, clé `sera-cookie-consent`). |
| `config/` | `company.js` : informations légales de la société, source unique pour le pied de page et les pages légales. |
| `styles/` | `index.css` et `settings.css` (variables) ; `components/*.css` et `pages/*.css`, un fichier par composant ou page. |

Autres éléments : `frontend/public/` (images, vidéos, favicon), `frontend/.env.example` (modèle de configuration).

**Emplacements prévus pour les prochains sprints.** L'en-tête contient quatre icônes : Rechercher, Mon compte, Favoris et Panier. Seule « Mon compte » est active : pour un visiteur, elle ouvre le modal de connexion ; pour un membre connecté, elle ouvre le panneau du compte (« Paramètres », « Se déconnecter »). Les icônes Rechercher, Favoris et Panier, ainsi que le bouton « Ajouter au panier » de la fiche produit (désactivé), sont des emplacements d'interface sans comportement associé : aucune route, aucun appel API ni aucune logique ne les alimente.

---

## 4. Base de données

Schéma : `database/ecommercedb.sql` (base `ecommercedb`, MySQL/MariaDB, `utf8mb4`). Ce script contient toutes les tables, données comprises. `database/newsletter.sql` ne contient que la table `newsletter_subscribers` : c'est un script isolé, déjà inclus dans `ecommercedb.sql`.

### Tables utilisées par l'application

| Table | Colonnes principales | Rôle |
|-------|----------------------|------|
| `categories` | `id`, `name`, `description`, `image_url` | Catégories (Hommes, Femmes, Enfants, Accessoires, Nouveautés) |
| `brands` | `id`, `name` | Marques |
| `product_types` | `id`, `name` | Types d'articles (Pulls, Pantalons, Vestes…), utilisés par le filtre |
| `products` | `id`, `name`, `description`, `price` (décimal 10,2), `stock` (≥ 0), `image_url`, `category_id`, `brand_id`, `type_id` | Produits |
| `sizes` | `id`, `label`, `sort_order` | Tailles, triées par `sort_order` |
| `product_sizes` | `product_id`, `size_id` | Table de liaison produit ↔ tailles |
| `newsletter_subscribers` | `id`, `email`, `consent_date` | Inscrits à la newsletter, avec la date du consentement |
| `users` | `id`, `first_name`, `last_name`, `address`, `postal_code`, `city`, `email` (unique), `password_hash` (BCrypt), `role` (défaut `ROLE_USER`) | Membres : créés par l'inscription, utilisés par la connexion ; prénom, nom, e-mail, adresse, code postal et ville modifiables depuis la page Mon compte (`password_hash` et `role` ne le sont jamais) |

### Tables prévues pour les évolutions futures

Les tables `orders`, `order_items` et `payments` sont **prévues pour les évolutions futures (commandes, paiement), non utilisées par l'application actuelle**. Aucune entité, route ni écran ne les utilise à ce jour. La table `users` est utilisée par l'inscription et la connexion (voir ci-dessus).

| Table | Colonnes principales |
|-------|----------------------|
| `orders` | `id`, `created_at`, `status` (défaut `PENDING`), `total_amount`, `shipping_address`, `user_id` |
| `order_items` | `id`, `order_id`, `product_id`, `quantity` (> 0), `unit_price` |
| `payments` | `id`, `order_id`, `stripe_id`, `amount`, `status`, `created_at` |

### Relations

```
categories 1 ───── * products * ───── 1 brands
product_types 1 ── * products
products * ───── * sizes            (via product_sizes)

users 1 ── * orders 1 ── * order_items * ── 1 products
                   orders 1 ── * payments
```

Clés étrangères définies dans le script :

| Table | Clé | Référence | Suppression |
|-------|-----|-----------|-------------|
| `products` | `category_id` | `categories.id` | `SET NULL` |
| `products` | `type_id` | `product_types.id` | `SET NULL` |
| `products` | `brand_id` | `brands.id` | (sans action) |
| `product_sizes` | `product_id` | `products.id` | `CASCADE` |
| `product_sizes` | `size_id` | `sizes.id` | (sans action) |
| `orders` | `user_id` | `users.id` | (sans action) |
| `order_items` | `order_id` | `orders.id` | `CASCADE` |
| `order_items` | `product_id` | `products.id` | (sans action) |
| `payments` | `order_id` | `orders.id` | `CASCADE` |

### Entités JPA

Sept entités existent : `Category`, `Brand`, `ProductType`, `Size`, `Product`, `NewsletterSubscriber` et `User` (table `users`). `Product` porte les relations `@ManyToOne` vers `category`, `brand` et `type`, et `@ManyToMany` vers `sizes` (triées par `sortOrder`).

---

## 5. API REST

Toutes les routes sont préfixées par `/api`. Les réponses sont en JSON. Le membre est authentifié par session HTTP (`/api/auth`) ; seule `PUT /api/auth/me` exige une session.

Les routes `/api/auth/login`, `/api/auth/register`, `GET` et `PUT /api/auth/me` renvoient toutes le même objet membre (`UserResponse`), sans mot de passe ni empreinte :

```json
{ "firstName": "...", "lastName": "...", "email": "...", "address": "...", "postalCode": "...", "city": "..." }
```

| Méthode | URL | Paramètres | Réponse | Codes |
|---------|-----|------------|---------|-------|
| `GET` | `/api/categories` | aucun | Liste des catégories | 200 |
| `GET` | `/api/categories/{id}/products` | `id` (chemin) : identifiant de la catégorie | Liste des produits de la catégorie ; liste vide si la catégorie n'existe pas ou n'a pas de produit | 200 |
| `GET` | `/api/products/latest` | aucun | Les 8 produits les plus récents (identifiant décroissant) | 200 |
| `GET` | `/api/products/{id}` | `id` (chemin) : identifiant du produit | Le produit, avec sa catégorie, sa marque, son type et ses tailles | 200, 404 |
| `POST` | `/api/newsletter` | Corps JSON : `{ "email": "...", "consent": true }` | `{ "message": "Merci, votre inscription est enregistrée." }` | 201, 400, 409 |
| `POST` | `/api/auth/login` | Corps JSON : `{ "email": "...", "password": "..." }` | L'objet membre et ouverture de la session (cookie `JSESSIONID`) | 200, 400, 401 |
| `POST` | `/api/auth/register` | Corps JSON : `{ "lastName", "firstName", "address", "postalCode", "city", "email", "password" }` | L'objet membre ; le compte est créé et la session ouverte (le membre est connecté) | 201, 400, 409 |
| `GET` | `/api/auth/me` | aucun (cookie de session) | L'objet membre connecté, relu en base à chaque appel | 200, 401 |
| `PUT` | `/api/auth/me` | Cookie de session ; corps JSON complet : `{ "firstName", "lastName", "email", "address", "postalCode", "city" }` (les six champs sont obligatoires) ; en-tête `Origin` vérifié s'il est présent | L'objet membre après enregistrement | 200, 400, 401, 403, 409 |
| `POST` | `/api/auth/logout` | aucun (cookie de session) | Aucun corps ; la session est détruite côté serveur | 204 |

### Format d'un produit

Les clés JSON suivent les noms des attributs de l'entité `Product` :

```json
{
  "id": 1,
  "name": "...",
  "description": "...",
  "price": 89.00,
  "stock": 12,
  "imageUrl": "/images/...",
  "category": { "id": 2, "name": "Femmes", "description": null, "imageUrl": "/images/women1.jpeg" },
  "brand": { "id": 1, "name": "..." },
  "type": { "id": 4, "name": "Pulls" },
  "sizes": [ { "id": 1, "label": "S", "sortOrder": 1 } ]
}
```

`type` et `category` peuvent valoir `null` (clés `SET NULL` en base).

### Codes d'erreur

| Code | Route | Cas | Corps |
|------|-------|-----|-------|
| 404 | `GET /api/products/{id}` | Produit inconnu | Erreur Spring standard, avec le motif « Produit introuvable » |
| 400 | `POST /api/newsletter` | `consent` absent ou `false` | `{ "message": "Le consentement est obligatoire pour s'inscrire." }` |
| 400 | `POST /api/newsletter` | E-mail vide ou invalide | `{ "message": "L'adresse e-mail n'est pas valide." }` |
| 409 | `POST /api/newsletter` | E-mail déjà inscrit | `{ "message": "Cette adresse e-mail est déjà inscrite." }` |
| 400 | `POST /api/auth/login` | E-mail ou mot de passe vide ou absent | `{ "message": "L'email et le mot de passe sont obligatoires." }` |
| 401 | `POST /api/auth/login` | E-mail inconnu **ou** mot de passe incorrect | `{ "message": "Email ou mot de passe incorrect" }` (identique dans les deux cas) |
| 401 | `GET /api/auth/me` | Pas de session, ou membre supprimé | `{ "message": "Non connecté." }` |
| 400 | `POST /api/auth/register` | Un des sept champs vide ou absent | `{ "message": "Tous les champs sont obligatoires." }` |
| 400 | `POST /api/auth/register` | Champ plus long que sa colonne | Par exemple `{ "message": "Le code postal ne doit pas dépasser 10 caractères." }` |
| 400 | `POST /api/auth/register` | E-mail invalide | `{ "message": "L'adresse e-mail n'est pas valide." }` |
| 400 | `POST /api/auth/register` | Mot de passe de moins de 8 caractères, ou de plus de 72 octets | `{ "message": "Le mot de passe doit contenir au moins 8 caractères." }` ou `{ "message": "Le mot de passe est trop long." }` |
| 409 | `POST /api/auth/register` | E-mail déjà utilisé par un membre | `{ "message": "Un compte existe déjà avec cette adresse e-mail." }` |
| 401 | `PUT /api/auth/me` | Pas de session, session sans membre, ou membre supprimé entre-temps | `{ "message": "Non connecté." }` |
| 403 | `PUT /api/auth/me` | En-tête `Origin` différent de l'origine autorisée | Corps texte `Invalid CORS request` (refus de la configuration CORS, voir plus bas) ; si la requête atteint le contrôleur : `{ "message": "Origine non autorisée." }` |
| 400 | `PUT /api/auth/me` | Un des six champs vide, absent ou composé d'espaces | `{ "message": "Tous les champs sont obligatoires." }` |
| 400 | `PUT /api/auth/me` | Champ plus long que sa colonne | Par exemple `{ "message": "Le prénom ne doit pas dépasser 100 caractères." }` |
| 400 | `PUT /api/auth/me` | E-mail invalide | `{ "message": "L'adresse e-mail n'est pas valide." }` |
| 409 | `PUT /api/auth/me` | E-mail déjà utilisé par **un autre** membre | `{ "message": "Un compte existe déjà avec cette adresse e-mail." }` |

`POST /api/auth/logout` ne renvoie jamais d'erreur : il répond 204 avec ou sans session, ce qui rend l'appel inoffensif si le membre est déjà déconnecté (session expirée, autre onglet).

Règles de l'inscription : les contrôles sont faits dans l'ordre du tableau ci-dessus ; les champs texte sont nettoyés (espaces retirés au début et à la fin) et l'e-mail est mis en minuscules avant la recherche de doublon et l'enregistrement ; le mot de passe n'est pas modifié. Si deux inscriptions simultanées utilisent le même e-mail, l'index unique de la colonne `email` refuse la seconde, qui reçoit aussi le 409.

Règles de la modification du profil (`AuthController.fUpdateMe` puis `AuthService.fUpdateProfile`), dans l'ordre :

1. **Session** : le membre est identifié uniquement par l'identifiant rangé dans la session. Le corps de la requête ne contient ni identifiant, ni rôle, ni mot de passe : un membre ne peut donc modifier que son propre compte, et jamais son mot de passe ni son rôle. Sans session valide : 401.
2. **En-tête `Origin`** : s'il est présent et différent de `app.cors.allowed-origin`, la requête est refusée (403). Cette écriture repose sur le cookie de session : le contrôle empêche un autre site d'envoyer la modification à la place du membre (falsification de requête). Une requête sans en-tête `Origin` (client hors navigateur) n'est pas concernée. En pratique, la configuration CORS refuse déjà toute requête dont l'`Origin` n'est pas autorisée, avant le contrôleur (réponse 403 au corps texte `Invalid CORS request`) ; la vérification du contrôleur reste une seconde barrière si la configuration CORS change. Une requête sans session reçoit le 401 avant ce contrôle, si elle atteint le contrôleur.
3. **Membre** : s'il n'existe plus en base, 401.
4. **Champs** : les six champs sont obligatoires (400) ; ils sont nettoyés (espaces retirés au début et à la fin), l'e-mail est mis en minuscules ; longueurs maximales identiques à l'inscription (400) ; format de l'e-mail (400).
5. **Doublon** : si l'e-mail appartient à un autre membre, 409. Conserver son propre e-mail est accepté.
6. **Enregistrement** : les six valeurs sont écrites dans une transaction, `password_hash` et `role` restent intacts. Si deux membres prennent le même e-mail en même temps, l'index unique refuse le second, qui reçoit aussi le 409.

La session conserve le même identifiant de membre après un changement d'e-mail : le membre reste connecté et se connectera ensuite avec la nouvelle adresse.

Règles de la newsletter : le consentement est vérifié avant le format de l'e-mail ; l'adresse est nettoyée (espaces retirés, minuscules) avant la recherche de doublon et l'enregistrement ; la date du consentement est enregistrée.

### CORS

Seule l'origine définie par `app.cors.allowed-origin` (variable `CORS_ALLOWED_ORIGIN`, défaut `http://localhost:5173`) peut appeler l'API, avec les méthodes `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`. `allowCredentials(true)` est activé pour que le navigateur envoie et reçoive le cookie de session ; l'origine est donc toujours explicite (jamais `*`). Côté front, Axios est configuré avec `withCredentials: true`. Une requête portant un en-tête `Origin` non autorisé est refusée par Spring avec un 403 (corps texte `Invalid CORS request`), quelle que soit la route.

---

## 6. Routes du frontend

Déclarées dans `frontend/src/App.jsx` (React Router, `BrowserRouter`).

| Route | Page | Contenu |
|-------|------|---------|
| `/` | `Home` | Vidéo, engagements, « Nos univers », liste des produits, bandeau éditorial, modal produit |
| `/about` | `About` | Qui sommes-nous |
| `/mentions-legales` | `MentionsLegales` | Mentions légales |
| `/cgv` | `Cgv` | Conditions générales de vente |
| `/confidentialite` | `Confidentialite` | Politique de confidentialité |
| `/cookies` | `Cookies` | Politique de cookies |
| `/mon-compte` | `MonCompte`, protégée par `MemberRoute` | Formulaire des informations personnelles du membre connecté |

`Header`, `Footer`, `CookieBanner` et `ScrollToTop` sont affichés quelle que soit la route. `ScrollToTop` remonte en haut à chaque changement de page, sauf si l'adresse contient une ancre (`#produits`), et désactive la restauration automatique du défilement par le navigateur (le bouton Précédent ouvre donc la page en haut). Le défilement vers `#produits` est assuré par `Home`, une fois la section « Nos univers » chargée, car elle modifie la position de la liste des produits en s'affichant.

La connexion et l'inscription n'ont pas de route : ce sont deux modals (`LoginModal`, `RegisterModal`) ouverts depuis l'icône « Mon compte » du `Header`, depuis n'importe quelle page. Le lien « Créer un compte » de la connexion ouvre l'inscription, et le lien « Se connecter » de l'inscription revient à la connexion ; le `Header` n'affiche jamais les deux à la fois. `AuthProvider` enveloppe toute l'application, ce qui permet au `Header` d'afficher « Bienvenue, [prénom] » sur toutes les routes.

Pour un membre connecté, l'icône « Mon compte » n'ouvre plus de modal : elle ouvre un panneau (`#account-panel`) avec le lien « Paramètres » (vers `/mon-compte`) et le bouton « Se déconnecter ». C'est un panneau de type *disclosure* : le bouton porte `aria-expanded` et `aria-controls`, le panneau est une simple liste parcourue avec Tab (pas de rôle `menu`). Il se ferme avec Échap (focus rendu à l'icône), par un clic extérieur (focus laissé en place), par un second clic sur l'icône ou par le choix d'une option. Pour un visiteur, le bouton porte `aria-haspopup="dialog"`.

### `MemberRoute` : pages réservées aux membres

`MemberRoute` (`components/MemberRoute.jsx`) enveloppe une page réservée aux membres (aujourd'hui `/mon-compte`). Il lit `objUser` et `blChecking` dans le contexte :

| Situation | Rendu |
|-----------|-------|
| Session en cours de vérification (`blChecking`, par exemple juste après un F5) | Rien : on ne redirige pas à tort un membre dont la session n'est pas encore relue |
| Membre connecté | La page |
| Membre qui vient de se déconnecter **sur** la page (le membre du rendu précédent existait) | Redirection vers `/`, sans ouvrir le modal |
| Visiteur arrivé directement sur l'adresse | Redirection vers `/` avec l'état `{ blOpenLogin: true }` |

Le `Header` lit cet état de navigation et ouvre le modal de connexion. À la fermeture du modal, il remplace l'entrée d'historique par la même adresse sans état, pour qu'un rechargement ne rouvre pas le modal.

### Fenêtres et compte membre

| Élément | Fichier | Rôle |
|---------|---------|------|
| `LoginModal` | `components/LoginModal.jsx` | Modal « Connexion » : e-mail et mot de passe obligatoires (contrôle avant envoi), appel `fLogin`, message d'erreur dans une zone `role="alert"`, champ mot de passe vidé et focus dessus après un échec, lien « Créer un compte ». |
| `RegisterModal` | `components/RegisterModal.jsx` | Modal « Créer un compte » : sept champs obligatoires décrits dans le tableau `TB_FIELDS` (libellé, type, `autocomplete`, longueur maximale). `fFindClientError` refait les contrôles de l'API (champ vide, format de l'e-mail, mot de passe de 8 caractères minimum et de 72 octets maximum) et place le focus sur le premier champ fautif. Les valeurs sont nettoyées (`trim`, sauf le mot de passe) puis envoyées par `fRegister`. En cas de refus du serveur, le mot de passe est vidé et le focus va sur l'e-mail (409) ou sur le mot de passe (autres cas). Lien « Se connecter » pour revenir à la connexion. |
| `useModalBehavior` | `hooks/useModalBehavior.js` | Hook partagé par `LoginModal`, `RegisterModal` et `ProductModal`. Reçoit la référence de la fenêtre, celle de l'élément qui reçoit le focus initial et la fonction de fermeture. Il place le focus initial, le rend à l'élément d'origine à la fermeture, ferme avec Échap, piège Tab et Maj+Tab dans la fenêtre (liens, boutons et champs actifs, les boutons désactivés étant ignorés) et bloque le défilement de la page (`body.style.overflow = 'hidden'`) tant que la fenêtre est ouverte. Si la fenêtre elle-même a le focus (`tabIndex=-1` : focus initial de la fiche produit, ou clic sur le fond de la fenêtre), Tab va au premier contrôle et Maj+Tab au dernier. |
| `ProductModal` | `components/ProductModal.jsx` | Fiche produit ouverte depuis `Home`. Charge le produit avec `GET /products/{id}` et appelle `useModalBehavior(objDialogRef, objDialogRef, fOnClose)` : la fenêtre elle-même reçoit le focus à l'ouverture, Tab et Maj+Tab bouclent sur la croix et les tailles (« Ajouter au panier » est désactivé), et le focus revient sur le bouton « Voir le produit » d'origine à la fermeture. |
| `MonCompte` | `pages/MonCompte.jsx` | Page `/mon-compte`. À l'ouverture, relit le profil avec `fRefreshProfile` (`GET /api/auth/me`) plutôt que de reprendre le contexte, puis affiche un formulaire de six champs décrits dans le tableau `arrFields` (`required`, `maxLength` de la colonne, `autocomplete`, type `email` pour l'adresse e-mail). L'envoi passe par `fUpdateProfile` (`PUT /api/auth/me`) ; une référence (`objSavingRef`) empêche une double soumission et le `fieldset` est désactivé pendant l'enregistrement. Succès : « Vos informations ont été mises à jour. » (`role="status"`) et formulaire remis aux valeurs renvoyées par l'API. Échec : le message de l'API, ou « Impossible d'enregistrer les modifications. Veuillez réessayer. », dans une zone `role="alert"` ; les saisies sont conservées. Échec de la lecture initiale : « Impossible de charger vos informations. Veuillez réessayer. » et un bouton « Réessayer ». |

Le formulaire de `MonCompte` n'a pas l'attribut `noValidate` : un champ vide ou une adresse sans `@` est bloqué par la validation du navigateur, sans appel à l'API. Les autres erreurs (adresse sans extension, champ ne contenant que des espaces, doublon) viennent de l'API.

Dans `AuthContext`, `fUpdateProfile` et `fRefreshProfile` mettent à jour `objUser` avec la réponse : le « Bienvenue, [prénom] » du `Header` change aussitôt après une modification du prénom. Sur une réponse 401 (session expirée), ils remettent `objUser` à `null` : `MemberRoute` renvoie alors le membre vers l'accueil.

Il n'y a pas de route dédiée pour une catégorie ou un produit : la catégorie choisie est un état de `App`, et la fiche produit est un modal de `Home`. Une adresse inconnue n'affiche que l'en-tête et le pied de page (aucune route « 404 » n'est déclarée).

---

## 7. Flux de données : de la catégorie aux produits

Exemple : le visiteur clique sur la catégorie « Femmes » dans l'en-tête.

```
1. Header › CategoryList          clic sur « Femmes »
        │  fOnSelect(objCategory)
        ▼
2. Header.fHandleSelectCategory   fOnSelectCategory(objCategory)  (état de App)
        │                          puis navigate('/')
        ▼
3. App                            objSelectedCategory = Femmes
        │  passé en props à Home et au Header
        ▼
4. Home                           useEffect → scrollIntoView vers la section produits
        │                          (une fois « Nos univers » chargé)
        │  objCategory passé à ProductList
        ▼
5. ProductList                    useEffect([objCategory])
        │  GET /categories/2/products   (Axios, services/api.js)
        ▼
6. CategoryController.fGetProducts(2)
        ▼
7. ProductService.fGetProductsByCategory(2)
        ▼
8. ProductRepository.findByCategoryId(2)   →  SELECT … FROM products WHERE category_id = 2
        ▼
9. Réponse JSON : liste de produits (avec marque, type et tailles)
        ▼
10. ProductList                   stocke les produits, calcule les types présents
                                  (sans doublon, triés), affiche les boutons de filtre
                                  et les vignettes (prix via fFormatPrice)
```

Points à retenir :

- Les catégories elles-mêmes sont chargées une fois par `CategoryList` (`GET /categories`) au montage.
- Sans catégorie choisie, `ProductList` appelle `GET /products/latest`.
- À chaque changement de catégorie, le filtre par type est remis sur « Tout ».
- Le filtre par type est **fait dans le navigateur** : `ProductList` filtre les produits déjà reçus selon `type.id`. L'API ne propose pas de paramètre de filtre.
- Un clic sur « Voir le produit » ouvre `ProductModal`, qui appelle `GET /products/{id}`. La fiche se comporte comme les autres fenêtres du site (hook `useModalBehavior`, voir la [section 6](#fenêtres-et-compte-membre)).

---

## 8. Standard de codage

Résumé du standard de codage du projet, qui constitue la définition du fini.

- **Variables** : `typeCamelCase` avec un préfixe de type : `int`, `fl`, `dt`, `str`, `tb`, `bl` (exemples : `strTitle`, `tbProducts`, `blLoading`). Le code utilise aussi le préfixe `obj` pour les objets (exemples : `objCategory`, `objApi`).
- **Fonctions** : `fCamelCase` (exemples : `fFormatPrice`, `fHandleSelectCategory`).
- **Exceptions** : les composants React restent en PascalCase (`ProductList`) ; les attributs des entités JPA ne sont pas renommés ; les noms imposés par Java, Spring ou Spring Data (constructeurs, `findByCategoryId`, `addCorsMappings`) sont conservés.
- **Commentaires** avec `//`. L'en-tête de chaque fonction indique ce qu'elle fait, ce qu'elle reçoit, ce qu'elle renvoie et pourquoi.
- **Langue** : commentaires et textes en français.
- **Pas d'opérateur ternaire** : utiliser `if / else` avec accolades.
- **Contenu** : le site est celui de la boutique SERA. Les textes, le code et la documentation s'adressent au client et à ses visiteurs, sans mention de contexte de développement.
- **Git** : ne jamais travailler directement sur `main` ; ne pas modifier la base sans le signaler.

---

## 9. Tests

| | Backend | Frontend |
|--|---------|----------|
| Outils | JUnit (Spring Boot Test), H2 en mémoire | Vitest, Testing Library, jsdom |
| Emplacement | `backend/src/test/java/com/ecommerce/backend/` | Fichiers `*.test.jsx` / `*.test.js` à côté du code, dans `frontend/src/` |
| Commande | `cd backend` puis `./mvnw test` (`mvnw.cmd test` sous Windows) | `cd frontend` puis `npm test` |
| Nombre de tests | **53** | **84** |

**Backend (53 tests)** : `BackendApplicationTests` (1, démarrage du contexte), `ApiIntegrationTest` (6), `NewsletterIntegrationTest` (4), `AuthIntegrationTest` (13, MockMvc : connexion, `me`, déconnexion, renouvellement de la session ; inscription réussie avec session ouverte, connexion avec le compte créé, e-mail déjà utilisé, champs vides ou invalides) et `ProfileIntegrationTest` (6 : lecture et persistance du profil ; changement d'e-mail avec session conservée et connexion avec la nouvelle adresse ; doublon et e-mail invalide sans modification des données ; refus sans session ou avec une session expirée ; impossibilité de viser un autre compte ou de modifier le mot de passe et le rôle ; refus d'une écriture venant d'une autre origine) pour les routes, `CategoryServiceTest` (2), `ProductServiceTest` (5), `NewsletterServiceTest` (4) et `AuthServiceTest` (12 : connexion ; inscription avec empreinte BCrypt, champ vide, e-mail invalide, mot de passe trop court ou trop long, champ trop long, doublon, doublon détecté par la base) pour les services. La base de test est H2 en mémoire (mode MySQL, schéma recréé à chaque exécution) : **elle ne touche jamais à MySQL**.

**Frontend (84 tests, 13 fichiers)** : `CategoryList` (3), `ProductList` (5), `ProductModal` (8 : contenu, focus initial dans la fenêtre, retour du focus, Échap, Fermer, piège de Tab et de Maj+Tab y compris depuis la fenêtre, blocage du défilement), `Footer` (5), `CookieBanner` (5), `ScrollToTop` (3), `Home` (3), `formatPrice` (3), `MonCompte` (7 : six champs du membre, redirection d'un visiteur avec ouverture du modal, pas de redirection pendant la vérification de session, accès depuis « Paramètres », déconnexion depuis la page ou depuis une autre page), `MonCompte.us6` (5 : lecture fraîche puis mise à jour du contexte après sauvegarde, saisies gardées après une erreur, chargement annoncé et nouvelle tentative, double soumission bloquée, session expirée oubliée), `LoginModal` (10 : labels et attributs, champs obligatoires, message d'erreur, état de chargement, piège du focus, fermeture, retour du focus), `RegisterModal` (12 : sept champs obligatoires et leurs attributs, focus initial, champ manquant, e-mail invalide, mot de passe trop court, envoi des champs nettoyés, e-mail déjà utilisé, serveur injoignable, état de chargement, lien vers la connexion, piège du focus, fermeture) et `Header` (15 : « Bienvenue », session retrouvée, panneau du compte, déconnexion, passage connexion ↔ inscription, bienvenue après l'inscription).

Autres contrôles :

- `npm run lint` : analyse statique avec oxlint.
- [`docs/tests-fonctionnels.md`](tests-fonctionnels.md) : cahier de tests manuels (parcours utilisateur, accessibilité), avec les colonnes « résultat obtenu » et « statut » à remplir.

Dernière exécution à la rédaction de ce document (25 novembre 2026) : 84/84 tests frontend et 53/53 tests backend réussis ; `npm run lint` sans erreur (2 avertissements : `ProductList.jsx`, mise à jour d'état dans un effet ; `Footer.jsx`, appel à `Date` pendant le rendu).

---

## 10. Installation en local et déploiement

- **Installation en local** (base XAMPP, backend sur le port 8080, frontend sur le port 5173) : voir le [README](../README.md).
- **Déploiement** (variables d'environnement, construction, lancement, vérification) : voir [docs/deploiement.md](deploiement.md).

Variables d'environnement, avec leurs valeurs par défaut de développement :

| Variable | Côté | Valeur par défaut |
|----------|------|-------------------|
| `VITE_API_URL` | Frontend (lue au build) | `http://localhost:8080/api` |
| `DB_URL` | Backend | `jdbc:mysql://localhost:3306/ecommercedb?...` |
| `DB_USERNAME` | Backend | `root` |
| `DB_PASSWORD` | Backend | (vide) |
| `CORS_ALLOWED_ORIGIN` | Backend | `http://localhost:5173` |

---

## 11. Workflow Git

- La branche `main` est la branche de référence : **on ne travaille jamais directement dessus**.
- Une branche par fonctionnalité, nommée `prenom/fonctionnalite` (par exemple `zakaria/tests`, `zakaria/mise-en-ligne`, `zakaria/documentation`).
- Les modifications sont regroupées dans des commits clairs, puis intégrées dans `main` par **pull request** sur GitHub, après relecture.
- Avant d'ouvrir une pull request : lancer `npm test` et `./mvnw test`, vérifier le respect du [standard de codage](#8-standard-de-codage) et mettre à jour la documentation si le comportement change.
- Toute modification de la base (script SQL) doit être signalée dans la pull request.

---

## 12. Sécurité des mots de passe

### Flux d'une connexion

1. Au démarrage, `AuthProvider` appelle `GET /api/auth/me` (avec le cookie) : un 401 signifie que personne n'est connecté.
2. L'icône « Mon compte » ouvre `LoginModal`. Le visiteur saisit son e-mail (login) et son mot de passe.
3. Le front envoie `POST /api/auth/login` avec `{ email, password }`, en HTTPS en production.
4. `AuthService.fAuthenticate` vérifie que les champs ne sont pas vides (400 sinon), cherche le membre par e-mail (minuscules, espaces retirés) et compare le mot de passe à `password_hash` avec BCrypt. Tout échec renvoie le même 401 « Email ou mot de passe incorrect ».
5. En cas de succès, `AuthController` invalide l'éventuelle ancienne session, en crée une nouvelle et y range l'identifiant du membre. Le serveur répond 200 avec l'objet membre (prénom, nom, e-mail, adresse, code postal, ville) et dépose le cookie `JSESSIONID`.
6. Le front mémorise le membre dans `AuthContext`, ferme le modal et le `Header` affiche « Bienvenue, [prénom] ».
7. Après un rechargement, l'étape 1 retrouve le membre grâce au cookie.

### Flux d'une inscription

Le flux complet est décrit dans la [section 13](#13-flux-du-compte-membre--inscription-modification-du-profil-déconnexion). Côté sécurité : le mot de passe n'est contrôlé (8 caractères minimum, 72 octets maximum) puis transformé en empreinte BCrypt que par le serveur, et la session est ouverte avec la même méthode que la connexion (`fOpenSession`, protection contre la fixation de session).

Le message 409 indique qu'un compte existe déjà pour cet e-mail : il est nécessaire pour que le visiteur comprenne le refus, mais il permet de savoir si une adresse est inscrite. Ce risque est accepté ici ; la limitation des tentatives recommandée plus bas le réduit aussi.

### BCrypt côté serveur

Les mots de passe ne sont jamais stockés ni comparés en clair. La colonne `password_hash` contient une empreinte BCrypt (`BCryptPasswordEncoder` de la dépendance `spring-security-crypto` seule, sans le reste de Spring Security). BCrypt est conçu pour les mots de passe : il intègre un **sel aléatoire** propre à chaque empreinte (deux mots de passe identiques donnent deux empreintes différentes) et un **coût de calcul volontairement élevé** qui ralentit les attaques par force brute en cas de fuite de la base. Pour un e-mail inconnu, le service effectue tout de même un calcul BCrypt factice afin que le temps de réponse ne révèle pas si le compte existe.

### HTTPS pour le transport

Le mot de passe voyage en clair dans le corps de la requête : c'est le **HTTPS** qui le protège entre le navigateur et l'API (chiffrement du canal). Il est donc obligatoire en production, et le cookie de session y est marqué `Secure` (variable `SESSION_COOKIE_SECURE`, voir [deploiement.md](deploiement.md)).

### Pourquoi on ne hashe pas côté client

Hasher le mot de passe dans le navigateur avant de l'envoyer n'apporte aucune sécurité : le hash **deviendrait lui-même le mot de passe**. Quiconque l'intercepte (ou le lit dans la base) pourrait l'envoyer tel quel et se connecter, sans rien connaître du mot de passe d'origine. Le serveur doit donc recevoir le secret et ne conserver que son empreinte, ce qui est exactement ce que fait BCrypt côté serveur. Le canal est protégé par HTTPS.

### Session HTTP, fixation de session et cookie HttpOnly

- L'authentification repose sur la session HTTP du serveur : seul un identifiant opaque (`JSESSIONID`) circule dans le cookie, le serveur garde l'identité du membre.
- **Fixation de session** : lors d'une connexion ou d'une inscription réussie, l'ancienne session est invalidée et une nouvelle est créée. Un identifiant de session connu d'avance d'un attaquant ne devient donc jamais une session authentifiée (testé par `fLogin_renouvelleLaSession`).
- **Cookie `HttpOnly`** : le cookie est inaccessible au JavaScript de la page, ce qui empêche un script injecté (XSS) de le voler. Il est aussi `SameSite=Lax` et `Secure` en production (`application.properties`).
- Le cookie n'est créé qu'à la connexion ou à l'inscription réussie : une tentative échouée ne dépose rien.

### Mot de passe : ce qui n'est jamais fait

- Il n'est **jamais écrit dans les logs** : aucun log applicatif ne le reçoit et `LoginRequest.toString()` comme `RegisterRequest.toString()` le masquent (`password=***`).
- Il n'est **jamais renvoyé dans une réponse JSON** : `AuthController` renvoie un objet dédié (`UserResponse`), pas l'entité `User`, donc `password_hash` ne sort pas non plus.
- Il n'est **pas conservé dans le state React** après l'envoi : le champ est vidé dès la réponse (succès ou échec) et `AuthContext` ne mémorise que l'objet membre renvoyé par l'API (prénom, nom, e-mail, adresse, code postal, ville).
- Les champs utilisent `type="password"` / `autocomplete="current-password"` et `type="email"` / `autocomplete="username"` à la connexion, `autocomplete="new-password"` à l'inscription, pour que les gestionnaires de mots de passe fonctionnent (et proposent un mot de passe robuste à l'inscription).
- Il ne dépasse pas **72 octets** : BCrypt ignore tout ce qui suit, un mot de passe plus long serait donc tronqué sans le dire. L'inscription le refuse.

### Compte de test

`database/ecommercedb.sql` contient un compte de test dont seul le hash BCrypt figure dans le dépôt. Le mot de passe en clair ne doit jamais être écrit dans le code, les tests ni la documentation.

### Évolution recommandée : limiter les tentatives

Cette version ne limite pas le nombre de tentatives de connexion. Il est recommandé d'ajouter, avant l'ouverture au public, un verrouillage temporaire après plusieurs échecs (par e-mail et par adresse IP) ou un délai croissant entre les essais, afin de freiner les attaques par force brute et par bourrage d'identifiants.

---

## 13. Flux du compte membre : inscription, modification du profil, déconnexion

Le flux de la connexion est décrit dans la [section 12](#flux-dune-connexion).

### Inscription

```
1. Header                         clic sur l'icône « Mon compte » (visiteur)
        │  fSetStrAuthModal('login')
        ▼
2. LoginModal                     clic sur « Créer un compte »
        │  fOnSwitchToRegister → fSetStrAuthModal('register')
        ▼
3. RegisterModal                  saisie des sept champs, clic sur « Créer mon compte »
        │  fFindClientError : champ vide, e-mail invalide, mot de passe < 8 caractères ou > 72 octets
        │  → message + focus sur le champ fautif, aucun appel à l'API
        ▼
4. AuthContext.fRegister          POST /auth/register  { lastName, firstName, address, postalCode, city, email, password }
        ▼                         (valeurs nettoyées par trim, sauf le mot de passe)
5. AuthController.fRegister
        ▼
6. AuthService.fRegister          champs obligatoires, longueurs, format de l'e-mail, mot de passe,
        │                          doublon (findByEmail), empreinte BCrypt
        ▼
7. UserRepository.saveAndFlush    INSERT INTO users …  (rôle ROLE_USER par défaut)
        ▼
8. AuthController.fOpenSession    ancienne session invalidée, nouvelle session avec userId
        │  201 + objet membre + cookie JSESSIONID
        ▼
9. AuthContext                    objUser = réponse
        ▼
10. RegisterModal / Header        formulaire vidé, modal fermé (focus rendu à l'icône),
                                  « Bienvenue, [prénom] »
```

En cas d'erreur (400 ou 409), `fRegister` lève une erreur portant le message de l'API et le code HTTP (`intStatus`, 0 si le serveur n'a pas répondu, avec le message « Inscription impossible pour le moment. Veuillez réessayer plus tard. »). `RegisterModal` vide le mot de passe, garde les autres champs et place le focus sur l'e-mail (409) ou sur le mot de passe.

### Modification du profil

```
1. Header                         « Paramètres » dans le panneau du compte → navigation vers /mon-compte
        ▼
2. MemberRoute                    blChecking ? rien : objUser ? la page : redirection vers /
        ▼
3. MonCompte (montage)            fRefreshProfile() → GET /auth/me
        │                          → objUser mis à jour, formulaire rempli avec les six champs
        ▼
4. MonCompte.fSave                clic sur « Enregistrer les modifications »
        │                          (validation du navigateur : required, type email, maxLength)
        │  objSavingRef bloque une double soumission ; fieldset désactivé
        ▼
5. AuthContext.fUpdateProfile     PUT /auth/me  { firstName, lastName, email, address, postalCode, city }
        ▼                         (cookie de session + en-tête Origin ajouté par le navigateur)
6. CorsConfig                     Origin non autorisée → 403 « Invalid CORS request »
        ▼
7. AuthController.fUpdateMe       session et userId ? sinon 401 ; Origin ≠ origine autorisée ? 403
        ▼
8. AuthService.fUpdateProfile     membre existant (401), champs obligatoires (400), nettoyage,
        │  (@Transactional)        longueurs (400), format de l'e-mail (400),
        │                          e-mail d'un autre membre (409)
        ▼
9. UserRepository.saveAndFlush    UPDATE users SET first_name, last_name, email, address,
        │                          postal_code, city  (password_hash et role inchangés)
        │  200 + objet membre
        ▼
10. AuthContext                   objUser = réponse → le Header affiche le nouveau prénom
        ▼
11. MonCompte                     formulaire remis aux valeurs enregistrées (nettoyées),
                                  « Vos informations ont été mises à jour. »
```

En cas d'erreur, `MonCompte` affiche `response.data.message` (ou « Impossible d'enregistrer les modifications. Veuillez réessayer. » si le serveur n'a pas répondu) et garde les saisies. Sur un 401, `fUpdateProfile` remet `objUser` à `null` : `MemberRoute` redirige vers l'accueil, sans ouvrir le modal de connexion.

### Déconnexion

```
1. Header                         clic sur l'icône « Mon compte » (membre) → panneau ouvert,
        │                          focus sur « Paramètres »
        ▼
2. Header.fHandleLogout           clic sur « Se déconnecter »
        ▼
3. AuthContext.fLogout            POST /auth/logout
        ▼
4. AuthController.fLogout         session existante ? invalidate()  →  204 dans tous les cas
        ▼
5. AuthContext                    objUser = null
        ▼
6. Header                         panneau fermé, focus rendu à l'icône, « Bienvenue » retiré ;
        │                          l'icône rouvre désormais le modal de connexion
        ▼
7. MemberRoute (si /mon-compte)   le membre du rendu précédent existait → redirection vers /,
                                  sans ouvrir le modal de connexion
```

Sur toute autre page, le visiteur reste où il était. Si l'API ne répond pas, `fLogout` lève l'erreur « Déconnexion impossible pour le moment. Veuillez réessayer plus tard. » **sans** remettre `objUser` à `null` (la session existe encore côté serveur) : le `Header` affiche le message dans la zone `role="alert"` du panneau, qui reste ouvert. Après la déconnexion, un rechargement appelle `GET /api/auth/me`, qui répond 401 : le visiteur reste déconnecté.
