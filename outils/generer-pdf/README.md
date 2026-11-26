# Générer les PDF de la documentation

Les fichiers Markdown de `docs/` sont les sources des PDF de `docs/pdf/`. On modifie le Markdown, puis on régénère le PDF.

## Prérequis

- Node.js 22 ou plus récent, avec npm.
- Google Chrome, Microsoft Edge ou Chromium. S'il n'est pas trouvé, indiquer son chemin dans la variable d'environnement `CHROME_PATH`.
- Windows de préférence : le texte utilise les polices Segoe UI et Consolas. Sur un autre système, la mise en page peut changer.
- Une connexion Internet lors de la première exécution, pour installer les bibliothèques.

## Régénérer en une commande

Depuis la racine du dépôt :

```
npm --prefix outils/generer-pdf run generer
```

Les bibliothèques sont installées automatiquement, puis les quatre PDF sont régénérés avec la date du jour.

Pour choisir les documents, la date ou la version :

```
npm --prefix outils/generer-pdf run generer -- tests-fonctionnels documentation-technique --date "26 novembre 2026" --version "Sprint 2"
```

| Nom du document | Source | Résultat |
|-----------------|--------|----------|
| `guide-utilisateur` | `docs/guide-utilisateur.md` | `docs/pdf/guide-utilisateur.pdf` |
| `documentation-technique` | `docs/documentation-technique.md` | `docs/pdf/documentation-technique.pdf` |
| `tests-fonctionnels` | `docs/tests-fonctionnels.md` | `docs/pdf/tests-fonctionnels.pdf` |
| `deploiement` | `docs/deploiement.md` | `docs/pdf/deploiement.pdf` |

La version par défaut se change dans `generer.mjs` (`STR_DEFAULT_VERSION`).

## Ce que contient chaque PDF

- Une page de garde (titre, version, date), puis un sommaire cliquable construit à partir des titres `##`.
- Des signets pour tous les titres, le nom du document et les numéros de page en pied de page.
- Les images entières, avec leur texte alternatif en légende.

## Règles d'écriture des sources

- Le premier titre `#` n'est pas repris : la page de garde le remplace.
- Une section `## Sommaire` écrite dans le fichier est remplacée par le sommaire du PDF.
- Une image placée seule dans son paragraphe devient une figure. Son chemin est relatif à `docs/`.
- Un lien vers un autre document (`deploiement.md`) mène à son PDF.

La génération s'arrête avec un message si une image manque, si un lien interne n'a pas de destination ou si un document demandé n'existe pas.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `generer.mjs` | Point d'entrée : liste des documents et options |
| `mise-en-page.mjs` | Conversion du Markdown en page HTML et feuille de style |
| `impression.mjs` | Impression avec le navigateur, signets, liens et propriétés du PDF |
