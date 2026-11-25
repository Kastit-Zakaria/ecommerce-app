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

Les documents livrés sont au format PDF, dans `docs/pdf/` :

- [Guide utilisateur](docs/pdf/guide-utilisateur.pdf) : utiliser le site (catégories, filtres, fiches produit, compte client, newsletter, cookies, pages légales).
- [Documentation technique](docs/pdf/documentation-technique.pdf) : architecture, base de données, API, tests, standard de codage, workflow Git.
- [Mise en ligne](docs/pdf/deploiement.pdf) : variables d'environnement, construction et déploiement.
- [Cahier de tests fonctionnels](docs/pdf/tests-fonctionnels.pdf) : tests manuels à dérouler avant une livraison, avec les résultats de la dernière exécution.

Les fichiers Markdown du dossier `docs/` (`guide-utilisateur.md`, `documentation-technique.md`, `deploiement.md`, `tests-fonctionnels.md`) sont les sources modifiables de ces PDF : toute mise à jour se fait dans ces fichiers, puis les PDF sont régénérés.
