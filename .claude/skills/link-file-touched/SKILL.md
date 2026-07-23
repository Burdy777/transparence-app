---
name: link-file-touched
description: A utiliser SYSTEMATIQUEMENT a chaque mode plan - que le plan soit demande dans le prompt de l'utilisateur (ex "fais un plan", "planifie", "propose une approche avant de coder") OU que le mode plan soit active dans la conversation (plan mode / ExitPlanMode). Dans TOUS ces cas, ce skill impose de TOUJOURS terminer la reponse par la liste cliquable des fichiers touches (crees ou modifies).
---

# Liens des fichiers touches (mode plan)

Ce skill s'applique a **chaque fois qu'un plan est en jeu** dans la conversation :

- l'utilisateur demande explicitement un plan dans son prompt (ex : "fais un plan",
  "planifie ca", "propose une approche avant de coder", "explique ta strategie d'abord") ;
- le **mode plan** est actif dans la session (plan mode configure, ou passage par
  `ExitPlanMode`).

Dans **tous** ces cas, sans exception : **la reponse doit TOUJOURS se terminer par la liste
cliquable des fichiers touches.**

## Regle imperative

A la toute fin de la reponse (dernier bloc), ajouter une section listant **chaque fichier cree
ou modifie** pendant le travail, sous forme de **liens Markdown cliquables** (format
`[texte](chemin)` relatif a la racine du workspace, comme impose par l'environnement VSCode).

Cette section est **obligatoire** meme si :

- le plan n'a pas encore ete execute -> lister alors les fichiers **qui seront** touches
  (fichiers cibles du plan) ;
- un seul fichier est concerne ;
- l'utilisateur ne l'a pas redemande dans ce message precis.

Ne jamais terminer par du remplissage ("n'hesitez pas...", etc.) apres cette section : la liste
des liens est le **dernier** contenu de la reponse.

## Format attendu

Separer creations et modifications quand les deux existent :

```markdown
## Fichiers touches

**Crees**
- [nom-du-fichier.ts](src/app/.../nom-du-fichier.ts)

**Modifies**
- [autre-fichier.ts](src/app/.../autre-fichier.ts)
```

S'il n'y a que des modifications (ou que des creations), garder une seule sous-liste avec le bon
intitule. Utiliser le **nom de base** du fichier comme texte du lien, et le **chemin relatif**
depuis la racine du repo comme cible (jamais de chemin absolu, jamais de backticks pour le lien).

## Rappels de format (contraintes VSCode du projet)

- Toujours `[texte](chemin-relatif)` — pas de backticks ni de balises HTML pour les references
  de fichiers.
- Chemin relatif depuis la racine du workspace (ex : `src/app/core/services/reports.ts`).
- Pour pointer une ligne precise si utile : `[fichier.ts:42](src/.../fichier.ts#L42)`.
