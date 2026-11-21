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
- Le backend expose des routes sous `/api`. Il n'a pas d'authentification à ce jour.
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
├── CLAUDE.md           Règles de développement du projet
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
| `service` | Logique métier et règles : 404 si un produit est inconnu, validation de la newsletter (consentement, format d'e-mail, doublon), connexion et inscription des membres (`AuthService`). |
| `controller` | Routes HTTP : reçoit la requête, appelle le service et renvoie la réponse JSON. Le `NewsletterController` convertit les erreurs du service en `{ "message": "..." }`. |
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
| `pages/` | Assemblage des composants pour une route : `Home`, `About`, `MentionsLegales`, `Cgv`, `Confidentialite`, `Cookies`. Les pages légales s'appuient sur le composant `LegalPage`. |
| `context/` | `AuthContext.jsx` : `AuthProvider` (membre connecté, `fLogin`, `fRegister`, `fLogout`) ; `useAuth.js` : hook d'accès ; `authContextObject.js` : objet de contexte partagé. Au démarrage, il appelle `GET /api/auth/me` pour retrouver la session. |
| `hooks/` | `useModalBehavior.js` : comportement commun aux fenêtres de connexion et d'inscription (focus initial et retour du focus, Échap, piège de Tab, blocage du défilement de la page). |
| `services/` | `api.js` crée le client Axios partagé (adresse via `VITE_API_URL`, `http://localhost:8080/api` par défaut, `withCredentials: true` pour le cookie de session) ; `newsletter.js` envoie l'inscription. |
| `utils/` | `formatPrice.js` (prix en euros, locale `fr-BE`) ; `cookieConsent.js` (lecture et écriture du choix de cookies dans `localStorage`, clé `sera-cookie-consent`). |
| `config/` | `company.js` : informations légales de la société, source unique pour le pied de page et les pages légales. |
| `styles/` | `index.css` et `settings.css` (variables) ; `components/*.css` et `pages/*.css`, un fichier par composant ou page. |

Autres éléments : `frontend/public/` (images, vidéos, favicon), `frontend/.env.example` (modèle de configuration).

**Emplacements prévus pour les prochains sprints.** L'en-tête contient quatre icônes (Rechercher, Mon compte, Favoris, Panier) ; seule « Mon compte » est active (ouverture du modal de connexion tant que personne n'est connecté). Les autres et la fiche produit un bouton « Ajouter au panier » désactivé. ainsi que le bouton « Ajouter au panier » sont des emplacements d'interface sans comportement associé : aucune route, aucun appel API ni aucune logique ne les alimente.

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
| `users` | `id`, `first_name`, `last_name`, `address`, `postal_code`, `city`, `email` (unique), `password_hash` (BCrypt), `role` (défaut `ROLE_USER`) | Membres : créés par l'inscription, utilisés par la connexion |

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

Toutes les routes sont préfixées par `/api`. Les réponses sont en JSON. Aucune route ne l'exige encore, mais l'API sait authentifier un membre par session HTTP (`/api/auth`).

| Méthode | URL | Paramètres | Réponse | Codes |
|---------|-----|------------|---------|-------|
| `GET` | `/api/categories` | aucun | Liste des catégories | 200 |
| `GET` | `/api/categories/{id}/products` | `id` (chemin) : identifiant de la catégorie | Liste des produits de la catégorie ; liste vide si la catégorie n'existe pas ou n'a pas de produit | 200 |
| `GET` | `/api/products/latest` | aucun | Les 8 produits les plus récents (identifiant décroissant) | 200 |
| `GET` | `/api/products/{id}` | `id` (chemin) : identifiant du produit | Le produit, avec sa catégorie, sa marque, son type et ses tailles | 200, 404 |
| `POST` | `/api/newsletter` | Corps JSON : `{ "email": "...", "consent": true }` | `{ "message": "Merci, votre inscription est enregistrée." }` | 201, 400, 409 |
| `POST` | `/api/auth/login` | Corps JSON : `{ "email": "...", "password": "..." }` | `{ "firstName": "...", "lastName": "...", "email": "..." }` et ouverture de la session (cookie `JSESSIONID`) | 200, 400, 401 |
| `POST` | `/api/auth/register` | Corps JSON : `{ "lastName", "firstName", "address", "postalCode", "city", "email", "password" }` | `{ "firstName": "...", "lastName": "...", "email": "..." }` ; le compte est créé et la session ouverte (le membre est connecté) | 201, 400, 409 |
| `GET` | `/api/auth/me` | aucun (cookie de session) | Le membre connecté : `{ "firstName", "lastName", "email" }` | 200, 401 |

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

Règles de l'inscription : les contrôles sont faits dans l'ordre du tableau ci-dessus ; les champs texte sont nettoyés (espaces retirés au début et à la fin) et l'e-mail est mis en minuscules avant la recherche de doublon et l'enregistrement ; le mot de passe n'est pas modifié. Si deux inscriptions simultanées utilisent le même e-mail, l'index unique de la colonne `email` refuse la seconde, qui reçoit aussi le 409.

Règles de la newsletter : le consentement est vérifié avant le format de l'e-mail ; l'adresse est nettoyée (espaces retirés, minuscules) avant la recherche de doublon et l'enregistrement ; la date du consentement est enregistrée.

### CORS

Seule l'origine définie par `app.cors.allowed-origin` (variable `CORS_ALLOWED_ORIGIN`, défaut `http://localhost:5173`) peut appeler l'API, avec les méthodes `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`. `allowCredentials(true)` est activé pour que le navigateur envoie et reçoive le cookie de session ; l'origine est donc toujours explicite (jamais `*`). Côté front, Axios est configuré avec `withCredentials: true`.

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

`Header`, `Footer`, `CookieBanner` et `ScrollToTop` sont affichés quelle que soit la route. `ScrollToTop` remonte en haut à chaque changement de page, sauf si l'adresse contient une ancre (`#produits`), et désactive la restauration automatique du défilement par le navigateur (le bouton Précédent ouvre donc la page en haut). Le défilement vers `#produits` est assuré par `Home`, une fois la section « Nos univers » chargée, car elle modifie la position de la liste des produits en s'affichant.

La connexion et l'inscription n'ont pas de route : ce sont deux modals (`LoginModal`, `RegisterModal`) ouverts depuis l'icône « Mon compte » du `Header`, depuis n'importe quelle page. Le lien « Créer un compte » de la connexion ouvre l'inscription, et le lien « Se connecter » de l'inscription revient à la connexion ; le `Header` n'affiche jamais les deux à la fois. `AuthProvider` enveloppe toute l'application, ce qui permet au `Header` d'afficher « Bienvenue, [prénom] » sur toutes les routes.

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
- Un clic sur « Voir le produit » ouvre `ProductModal`, qui appelle `GET /products/{id}`.

---

## 8. Standard de codage

Résumé des règles de `CLAUDE.md`, qui constitue la définition du fini.

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
| Nombre de tests | **47** | **76** |

**Backend (47 tests)** : `BackendApplicationTests` (1, démarrage du contexte), `ApiIntegrationTest` (6), `NewsletterIntegrationTest` (4) et `AuthIntegrationTest` (13, MockMvc : connexion, `me`, déconnexion, renouvellement de la session ; inscription réussie avec session ouverte, connexion avec le compte créé, e-mail déjà utilisé, champs vides ou invalides) pour les routes, `CategoryServiceTest` (2), `ProductServiceTest` (5), `NewsletterServiceTest` (4) et `AuthServiceTest` (12 : connexion ; inscription avec empreinte BCrypt, champ vide, e-mail invalide, mot de passe trop court ou trop long, champ trop long, doublon, doublon détecté par la base) pour les services. La base de test est H2 en mémoire (mode MySQL, schéma recréé à chaque exécution) : **elle ne touche jamais à MySQL**.

**Frontend (76 tests, 12 fichiers)** : `CategoryList` (3), `ProductList` (5), `ProductModal` (5), `Footer` (5), `CookieBanner` (5), `ScrollToTop` (3), `Home` (3), `formatPrice` (3), `MonCompte` (7), `LoginModal` (10 : labels et attributs, champs obligatoires, message d'erreur, état de chargement, piège du focus, fermeture, retour du focus), `RegisterModal` (12 : sept champs obligatoires et leurs attributs, focus initial, champ manquant, e-mail invalide, mot de passe trop court, envoi des champs nettoyés, e-mail déjà utilisé, serveur injoignable, état de chargement, lien vers la connexion, piège du focus, fermeture) et `Header` (15 : « Bienvenue », session retrouvée, panneau du compte, déconnexion, passage connexion ↔ inscription, bienvenue après l'inscription).

Autres contrôles :

- `npm run lint` : analyse statique avec oxlint.
- [`docs/tests-fonctionnels.md`](tests-fonctionnels.md) : cahier de tests manuels (parcours utilisateur, accessibilité), avec les colonnes « résultat obtenu » et « statut » à remplir.

Dernière exécution à la rédaction de ce document : 76/76 tests frontend et 47/47 tests backend réussis.

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
5. En cas de succès, `AuthController` invalide l'éventuelle ancienne session, en crée une nouvelle et y range l'identifiant du membre. Le serveur répond 200 avec `{ firstName, lastName, email }` et dépose le cookie `JSESSIONID`.
6. Le front mémorise le membre dans `AuthContext`, ferme le modal et le `Header` affiche « Bienvenue, [prénom] ».
7. Après un rechargement, l'étape 1 retrouve le membre grâce au cookie.

### Flux d'une inscription

1. Dans `LoginModal`, le lien « Créer un compte » remplace la fenêtre de connexion par `RegisterModal`.
2. Le visiteur saisit son nom, son prénom, son adresse, son code postal, sa ville, son e-mail et un mot de passe d'au moins 8 caractères. Le front refait les contrôles de l'API (champs obligatoires, format de l'e-mail, longueur du mot de passe) pour éviter un aller-retour inutile, et place le focus sur le champ à corriger.
3. Le front envoie `POST /api/auth/register`, en HTTPS en production.
4. `AuthService.fRegister` applique toutes les règles (voir [Codes d'erreur](#codes-derreur)), calcule l'empreinte BCrypt du mot de passe et enregistre le membre avec le rôle `ROLE_USER`.
5. `AuthController` ouvre une session neuve, exactement comme après une connexion (même méthode `fOpenSession`), et répond 201 avec `{ firstName, lastName, email }`.
6. Le front mémorise le membre dans `AuthContext`, ferme le modal et le `Header` affiche « Bienvenue, [prénom] » sur toutes les pages.

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
- Il n'est **pas conservé dans le state React** après l'envoi : le champ est vidé dès la réponse (succès ou échec) et `AuthContext` ne mémorise que le prénom, le nom et l'e-mail.
- Les champs utilisent `type="password"` / `autocomplete="current-password"` et `type="email"` / `autocomplete="username"` à la connexion, `autocomplete="new-password"` à l'inscription, pour que les gestionnaires de mots de passe fonctionnent (et proposent un mot de passe robuste à l'inscription).
- Il ne dépasse pas **72 octets** : BCrypt ignore tout ce qui suit, un mot de passe plus long serait donc tronqué sans le dire. L'inscription le refuse.

### Compte de test

`database/ecommercedb.sql` contient un compte de test dont seul le hash BCrypt figure dans le dépôt. Le mot de passe en clair ne doit jamais être écrit dans le code, les tests ni la documentation.

### Évolution recommandée : limiter les tentatives

Cette version ne limite pas le nombre de tentatives de connexion. Il est recommandé d'ajouter, avant l'ouverture au public, un verrouillage temporaire après plusieurs échecs (par e-mail et par adresse IP) ou un délai croissant entre les essais, afin de freiner les attaques par force brute et par bourrage d'identifiants.
