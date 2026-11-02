# E-commerce

Projet de site e-commerce : front-end React, back-end Java Spring Boot, base de données MySQL.

## Prérequis

- XAMPP (MySQL)
- Java 17 minimum (JDK 21 recommandé)
- Node.js

## Installation

### 1. Base de données
Dans phpMyAdmin, créer une base `ecommercedb`, puis importer `database/ecommercedb.sql`.

### 2. Backend (port 8080)
Ouvrir le projet dans IntelliJ et lancer `BackendApplication`.

### 3. Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```

## Documentation

- [Guide utilisateur](docs/guide-utilisateur.md) : utiliser le site (catégories, filtres, fiches produit, newsletter, cookies, pages légales).
- [Documentation technique](docs/documentation-technique.md) : architecture, base de données, API, tests, standard de codage, workflow Git.
- [Mise en ligne](docs/deploiement.md) : variables d'environnement, construction et déploiement.
- [Cahier de tests fonctionnels](docs/tests-fonctionnels.md) : tests manuels à dérouler avant une livraison.
