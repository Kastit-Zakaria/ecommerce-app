# Mise en ligne du site SERA

## Prérequis

- Java 17 ou supérieur (JDK) pour construire et lancer le backend
- Node.js (version LTS) et npm pour construire le frontend
- MySQL 8 ou MariaDB (équivalent à la base XAMPP utilisée en développement)
- Un serveur web (Nginx, Apache, hébergement statique…) pour servir le frontend
- Un nom de domaine et un certificat HTTPS pour le site et pour l'API

## Variables d'environnement

### Frontend (lues au moment du build)

| Variable | Rôle | Valeur par défaut |
|----------|------|-------------------|
| `VITE_API_URL` | URL de base de l'API, sans « / » final (ex. `https://api.sera.be/api`) | `http://localhost:8080/api` |

Un modèle est fourni dans `frontend/.env.example` : le copier en `frontend/.env` (fichier non versionné) et adapter la valeur.
La valeur est intégrée au site lors de `npm run build` : il faut donc reconstruire le frontend à chaque changement d'adresse de l'API.

### Backend (lues au démarrage)

| Variable | Rôle | Valeur par défaut |
|----------|------|-------------------|
| `DB_URL` | URL JDBC de la base | `jdbc:mysql://localhost:3306/ecommercedb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `DB_USERNAME` | Utilisateur MySQL | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | (vide) |
| `CORS_ALLOWED_ORIGIN` | Origine du site autorisée à appeler l'API (ex. `https://www.sera.be`) | `http://localhost:5173` |

En production, créer un utilisateur MySQL dédié avec un mot de passe robuste : ne pas utiliser `root` sans mot de passe.

## Import de la base de données

1. Créer la base `ecommercedb` (encodage `utf8mb4`).
2. Importer le fichier `database/ecommercedb.sql` (phpMyAdmin, onglet Importer, ou `mysql -u <utilisateur> -p ecommercedb < database/ecommercedb.sql`).

Ce fichier contient toutes les tables, y compris `newsletter_subscribers` : aucun autre fichier n'est à importer.
Le schéma doit exister avant le démarrage du backend, qui le vérifie (`ddl-auto=validate`).

## Construction

### Frontend

```bash
cd frontend
npm install
npm run build
```

Les fichiers produits se trouvent dans `frontend/dist/` (page HTML, JavaScript, CSS, images, vidéo).

### Backend

```bash
cd backend
./mvnw package
```

Le JAR exécutable est produit dans `backend/target/backend-0.0.1-SNAPSHOT.jar`.
Pour construire sans relancer les tests : `./mvnw package -DskipTests`.

## Lancement

### Backend

```bash
export DB_URL="jdbc:mysql://<hote>:3306/ecommercedb?useSSL=true&serverTimezone=UTC"
export DB_USERNAME="<utilisateur>"
export DB_PASSWORD="<mot_de_passe>"
export CORS_ALLOWED_ORIGIN="https://www.sera.be"
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```

L'API écoute par défaut sur le port 8080. Prévoir un proxy inverse HTTPS devant, ou un service système qui relance le JAR.

### Frontend

Copier le contenu de `frontend/dist/` dans le dossier servi par le serveur web (ex. `/var/www/sera`).
Le site est une application à page unique : si des routes côté navigateur sont ajoutées, configurer le serveur pour renvoyer `index.html` sur les URL inconnues.

## Vérification après mise en ligne

1. Ouvrir le site : la vidéo d'accueil et les catégories s'affichent.
2. Cliquer sur une catégorie : les produits s'affichent (sinon, vérifier `VITE_API_URL` et `CORS_ALLOWED_ORIGIN`).
3. Tester l'inscription à la newsletter.
