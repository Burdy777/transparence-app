---
name: signal-store
description: Patterns pour creer ou modifier des NgRx Signal Stores dans ce projet Angular. A utiliser quand l'utilisateur cree ou modifie un store (@ngrx/signals), demande les conventions de nommage des stores, ou le template standard d'un store de feature.
---

# NgRx Signal Store Patterns
Use this skill when creating or modifying NgRx Signal Stores.
## Standard Store Template
features\user\state\user.store.ts
## Naming Conventions
- Store file: `<feature>.store.ts`
- Store class: `<Feature>Store`
- Provide at root: `{ providedIn: 'root' }` for app-wide stores
- Provide at component: omit `providedIn` for scoped stores