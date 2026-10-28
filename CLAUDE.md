# Projet SERA — règles pour Claude Code
- Front : React (Vite) dans frontend/ ; back : Java Spring Boot 4 dans backend/ ; base MySQL (XAMPP).
- Standard de codage (définition du fini) :
  - Variables : typeCamelCase avec préfixe int, fl, dt, str, tb, bl (ex. strTitle, tbProducts, blLoading).
  - Fonctions : fCamelCase (ex. fFormatPrice, fHandleSelectCategory).
  - Exceptions : composants React en PascalCase (ProductList) ; attributs des entités JPA inchangés.
  - Commentaires avec // ; en-tête de chaque fonction : ce qu'elle fait, ce qu'elle reçoit, ce qu'elle renvoie, pourquoi.
- Commentaires et textes en français.
- Pas d'opérateurs ternaires : if/else avec accolades.
- Ne jamais travailler sur main ; ne pas modifier la base sans le dire.
