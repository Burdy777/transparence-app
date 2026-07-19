---
name: todo
description: Suivi de la todo-list du projet (pages Auth, Accueil, Intervention, Anomalie, Historique). A utiliser en debut de session pour voir ou en est le projet, quand l'utilisateur demande "c'est quoi la suite", "on en est ou", "coche cette tache", ou a la fin d'une tache livree pour la marquer faite et proposer la suivante.
---

# Suivi du projet

Cette todo-list est la source de verite des taches restantes sur le projet. Elle vit dans ce
fichier et est versionnee avec le code.

## Arguments

`$ARGUMENTS` peut contenir le nom d'une page pour filtrer l'affichage : `auth`, `accueil`,
`intervention`, `anomalie` ou `historique` (insensible a la casse, accents optionnels).



- Si `$ARGUMENTS` correspond a une page : affiche uniquement l'etat de cette section
  (taches faites / en cours / restantes), sans resumer les autres pages.

  `$ARGUMENTS` peut aussi contenir `list`, ca veut dire donne la checklist complete de todo, avec les titres de chaque tâche

- Si `$ARGUMENTS` est vide : comportement par defaut ci-dessous (resume brievement de tout le projet).
- Si `$ARGUMENTS` ne correspond a aucune page connue : le signaler a l'utilisateur et
  proposer les noms valides plutot que de deviner.

## Comment l'utiliser

- **En debut de session** (ou quand on t'appelle avec ce skill) : lis la liste ci-dessous,
  resume TRES brievement ce qui est fait / en cours / restant, et demande sur quelle tache
  l'utilisateur veut avancer si ce n'est pas deja precise.
- **Quand une tache est terminee et validee par l'utilisateur** : coche-la (`- [ ]` -> `- [x]`)
  dans ce fichier via Edit. Ne coche jamais une tache sans confirmation explicite de
  l'utilisateur que c'est fait et satisfaisant.
- **Si une tache est abandonnee ou devient obsolete** : ne la supprime pas, raye-la avec
  `~~texte~~` et ajoute entre parentheses la raison si l'utilisateur la donne (ex:
  `~~Couleur a revoir~~ (validee telle quelle)`).
- **Ne reformule et ne divise jamais une tache sans demander** : si une tache est ambigue,
  demande a l'utilisateur plutot que d'inventer un sens ou un decoupage.
- **Ne complete jamais une tache tout seul par supposition** : coche uniquement ce qui a ete
  explicitement fait et confirme dans la conversation.

## Etat du projet

### Page Auth
- [ ] Mettre le logo
- [ ] Trouver un titre accrocheur
- [ ] Valider la couleur background
- [ ] Libeller bouton
- [ ] Creation de l'API de connexion Node JS
- [ ] Integrer le client de AUTH MICROSRVICE
- [ ] Faire la connexion front back pour l'Authentification
- [ ] Gestion du token, et refresh token
- [ ] Gerer le rechargement de page
- [ ] Et token enlever du cache

### Page Accueil
- [ ] Mettre logo sur header
- [ ] Avoir le nom de l'agent
- [ ] Trouver un texte accrocheur
- [ ] Trouver de bon logo
- [ ] Idee de design ?

### Page Intervention
- [ ] Mettre logo sur header
- [ ] Mettre bon texte sur header
- [ ] Trouver un texte sous barre de progression
- [ ] Mettre les bons champs
- [ ] Validation photo, limitation photo
- [ ] Api Node.js de creation d'intervention
- [ ] Api se connecter au Drive
- [ ] Creation Api Angular
- [ ] Page de succes apres envoi
- [ ] Gerer le statut du formulaire (sauvegarde ou pas)
- [ ] Couleur a revoir ou pas ?
- [ ] Api pour recuperer nom chantier etc. et preremplir

### Page Anomalie
- [ ] Mettre logo sur header
- [ ] Mettre bon texte sur header
- [ ] Trouver un texte sous barre de progression
- [ ] Mettre barre de progression
- [ ] Mettre les bons champs
- [ ] Validation photo, limitation photo
- [ ] Api Node.js de creation anomalie
- [ ] Api se connecter au Drive (ajustement)
- [ ] Creation Api Angular (ajustement)
- [ ] Page de succes apres envoi
- [ ] Gerer le statut du formulaire (sauvegarde ou pas)
- [ ] Couleur a revoir ou pas ?

### Page Historique
- [ ] Gerer l'historique
