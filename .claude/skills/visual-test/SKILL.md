---
name: visual-test
description: Tester visuellement une page ou un composant Angular dans le navigateur (mobile et desktop). A utiliser quand l'utilisateur demande de verifier un changement de design "en vrai", de lancer l'app et prendre des captures, ou de tester le rendu d'une page. Lance ng serve, pilote le navigateur via Playwright MCP, contourne l'authentification, teste en priorite le mobile et tablette, puis nettoie les fichiers temporaires.
---

# Test visuel d'un composant Angular

Workflow pour verifier le rendu reel d'une page dans le navigateur. La priorite est
toujours la **vue mobile et tablette** ; le desktop est secondaire.

## Prerequis

- Le projet est un Angular zoneless (voir CLAUDE.md). Ne jamais lancer l'app sans que
  l'utilisateur l'ait demande explicitement (voir la memoire `no-auto-run-app`).
- Les icones dependent de la police Material Icons chargee via CDN dans `src/index.html`.
  Si les icones s'affichent en texte brut (ex: "nc", "hi"), attendre `document.fonts.ready`
  avant de capturer.

## Phase 1 - Lancer le serveur de dev

Lancer `ng serve` en arriere-plan depuis la racine frontend. Sous Windows, utiliser
PowerShell et rediriger la sortie :

```
cd '<racine-frontend>'; npm start
```

Attendre que le serveur reponde (HTTP 200) avant de continuer :

```
try { (Invoke-WebRequest -Uri "http://localhost:4200/" -UseBasicParsing -TimeoutSec 5).StatusCode } catch { "DOWN" }
```

Ne pas boucler avec des `Start-Sleep` chaines : lancer en arriere-plan et attendre la
notification de fin, ou re-verifier avec la commande ci-dessus.

## Phase 2 - Ouvrir la page et contourner l'authentification

Les pages sont protegees par `authGuard` (redirige vers `/login` si pas de token).
Pour tester sans backend, injecter un faux token dans le localStorage.

1. Naviguer une premiere fois vers l'URL (cree le contexte navigateur).
2. Injecter le token puis rediriger via `window.location.href` (recharge avec l'auth active) :

```js
() => {
  localStorage.setItem('chantier_app_token', 'fake-token-for-testing');
  localStorage.setItem('chantier_app_agent', JSON.stringify({
    id: '1', email: 'test@example.com', name: 'Jean Dupont'
  }));
  window.location.href = '/nouveau-rapport';
  return 'ok';
}
```

Cles localStorage (definies dans `core/services/auth.ts`) : `chantier_app_token` et
`chantier_app_agent`. La structure agent est `{ id, email, name }`.

Route du formulaire de rapport : `/nouveau-rapport`.

## Phase 3 - Tester en vue mobile (priorite)

Redimensionner le navigateur en format telephone AVANT de capturer :

```
browser_resize  width=390  height=844   (format iPhone)
```

Points a verifier sur le formulaire de rapport :
- Header colore mobile visible en haut (masque sur desktop).
- Bouton menu flottant (hamburger) en haut a gauche ; le clic ouvre le menu lateral.
- Barre d'action (Annuler / Envoyer) fixe en bas de l'ecran.
- Les icones Material s'affichent (pas de texte brut).

Verifier que la police d'icones est chargee avant de capturer :

```js
async () => { await document.fonts.ready; return document.fonts.check('24px "Material Icons"'); }
```

Prendre la capture et **la regarder** : un ecran blanc = echec de rendu, pas un succes.

## Phase 4 - Tester en vue desktop (secondaire)

Redimensionner en `width=1200 height=800`, capturer, verifier que le layout reste
coherent. Ne pas y passer trop de temps : le mobile est la priorite.

## Phase 5 - Nettoyer (obligatoire)

Playwright MCP ecrit dans `.playwright-mcp/` (logs + captures) et `ng serve` peut laisser
`server.log`. Ces fichiers sont ignores par git mais ne doivent pas trainer.

1. Arreter le serveur : `Get-Process node* | Stop-Process -Force`.
2. Supprimer les temporaires :

```
rm -rf .playwright-mcp && rm -f *.png server.log server.err
```

`server.log` reste verrouille tant que le serveur tourne : toujours arreter node avant.

## Notes de stabilite

- Le navigateur Playwright MCP peut se fermer entre deux appels ("Target page ... closed").
  Dans ce cas : appeler `browser_close` puis `browser_navigate` a nouveau. Le contexte
  (localStorage, viewport) est reinitialise, donc re-injecter le token et re-redimensionner.
- Enchainer navigate -> resize -> injection token -> capture sans laisser le navigateur
  inactif reduit les fermetures.
