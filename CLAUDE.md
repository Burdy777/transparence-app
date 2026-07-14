# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Mobile-first Angular 22 app letting cleaning agents file an intervention report (site info, notes, before/after photos) from their phone. It is the `frontend/` half of a two-repo project; the sibling `technician-intervention-transparence-backend/` is a Node/Express API that authenticates agents (JWT), uploads photos to Google Drive, and forwards the report's text data to an **external storage API**. The backend has no database of its own — see the parent directory's `README.md` for the full system description.

UI text is French (unaccented, e.g. `apres`, `rapport envoye`). Keep new user-facing strings in the same style.

## Commands

```bash
npm start                       # ng serve on http://localhost:4200 (dev config)
npm run build                   # production build (defaultConfiguration: production) -> dist/
npm run watch                   # rebuild on change, development config
npm test                        # Vitest via `ng test` (@angular/build:unit-test builder)
npx ng test --test-file src/app/app.spec.ts   # single spec file
```

The backend must be running on `http://localhost:3000` for login and report submission to work in dev.

## Architecture

Standalone components throughout — no NgModules. Bootstrapped in [src/main.ts](src/main.ts) with [app.config.ts](src/app/app.config.ts), which wires `provideRouter`, and `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`.

**Routing** ([app.routes.ts](src/app/app.routes.ts)) — all routes lazy-load their component. Route paths are French: `/login`, `/nouveau-rapport` (default), `/historique`. The latter two are protected by [authGuard](src/app/core/guards/auth-guard.ts), which redirects to `/login` when no token is present.

**Auth** ([core/services/auth.ts](src/app/core/services/auth.ts)) — JWT + agent object live in `localStorage` under `chantier_app_token` / `chantier_app_agent`. `currentAgent` is a signal seeded from `localStorage` at construction, so a reload restores the session. [authInterceptor](src/app/core/interceptors/auth-interceptor.ts) attaches `Authorization: Bearer <token>` to every outgoing request when a token exists.

**Report submission** ([core/services/reports.ts](src/app/core/services/reports.ts)) — `POST {apiBaseUrl}/reports` as `multipart/form-data`; photos go in repeated `beforePhotos` / `afterPhotos` fields. The response (`CreateReportResult`) carries Google Drive `webViewLink`s for each uploaded photo.

**History is device-local, not server-side.** The backend exposes no read endpoint (reports live in the external API), so [report-form.ts](src/app/features/report-form/report-form.ts) writes each successful submission into `localStorage` under `chantier_app_local_history` (capped at 50 entries) and [report-history.ts](src/app/features/report-history/report-history.ts) just reads that key back. Anything that looks like it should query the server for past reports currently cannot.

**Environments** — `apiBaseUrl` is `http://localhost:3000/api` in [environment.ts](src/environments/environment.ts) and `/api` in [environment.prod.ts](src/environments/environment.prod.ts) (assumes a reverse proxy in prod). `angular.json` swaps the file via `fileReplacements` on the production configuration only.

## Conventions

- Class names are bare (`Auth`, `Reports`, `App`, `Login`, `ReportForm`, `ReportHistory`) — no `Service`/`Component` suffix, matching Angular 22 CLI defaults. Filenames match (`auth.ts`, not `auth.service.ts`).
- State in components is `signal()`; forms are reactive (`FormBuilder` + `Validators`). Services are injected with `inject()` in components/guards/interceptors and via constructor in services.
- Photo previews use `URL.createObjectURL` — revoke on remove and on form reset (see `removePhoto` / `resetForm`) to avoid leaking blobs.
- Styling: SCSS, no UI library. Global tokens (`--color-primary`, `--radius`, `--spacing`, …) are declared on `:root` in [src/styles.scss](src/styles.scss); prefer them over hardcoded values. Per-component styles have a hard 8kB budget in production builds.
- TypeScript is `strict` with `strictTemplates` and `noPropertyAccessFromIndexSignature`. Prettier: 100 cols, single quotes (configured in `package.json`).

## Known state

[app.spec.ts](src/app/app.spec.ts) is leftover CLI scaffolding — its "should render title" test asserts an `<h1>` containing "Hello, frontend" that the real `app.html` does not have, so it fails. There is no other test coverage yet.
