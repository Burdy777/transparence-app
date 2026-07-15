# Enterprise Angular App — Claude Code Context

## What this is

Mobile-first Angular 22 app letting cleaning agents file an intervention report (site info, notes, before/after photos) from their phone. It is the `frontend/` half of a two-repo project. The backend is a Node/Express API that authenticates agents (JWT), uploads photos to Google Drive, and forwards the report's text data to an **external storage API**. 
UI text is French (unaccented, e.g. `apres`, `rapport envoye`). Keep new user-facing strings in the same style.

**Environments** — `apiBaseUrl` is `http://localhost:3000/api` in [environment.ts](src/environments/environment.ts) and `/api` in [environment.prod.ts](src/environments/environment.prod.ts) (assumes a reverse proxy in prod). `angular.json` swaps the file via `fileReplacements` on the production configuration only.

## Stack
- Angular 22 with standalone components and zoneless change detection
- NgRx SignalStore (@ngrx/signals) for all shared/feature state
- Bootstrap 5.3 via SCSS - NO Angular Material, NO Tailwind
- RxJS for async operations; convert to signals at component boundary with toSignal()
- Angular Eslint for lint
- TypeScript strict mode enforced
## Project Layout
See @src/app/features for feature modules. Each feature has: components/, state/, services/, *.routes.ts, models/, pages/
See @src/app/core for app-wide singletons: services/, guards/, interceptors/, models/ (and state/ for global stores). Provided once at bootstrap - never import feature code from here.
See @src/app/shared for reusable, stateless building blocks: components/, and any shared pipes/directives/utils. No feature-specific logic and no dependency on core services.
See @package.json for all available npm commands.
## Commands
- Build: `ng build`
- Dev server: `ng serve`
- Test single file: `ng test --include=**/<name>*.spec.ts`
- Lint: `ng lint`
- Type check: `npx tsc --noEmit`
## Angular Rules
- ALWAYS use standalone components (`standalone: true` in @Component)
- ALWAYS use `inject()` function - never constructor injection
- ALWAYS use `input()` signal API for @Input, `output()` for @Output
- Use `OnPush` change detection strategy on all components
- Use `@defer` blocks for non-critical UI sections
- Prefer `httpResource()` for simple GET requests; use HttpClient for mutations
## State Management Rules
- Feature state lives in `features/<name>/state/<name>.store.ts`
- Global state lives in `core/state/<name>.store.ts`
- Store files use the NgRx SignalStore pattern (see @src/app/features/users/state/users.store.ts)
- Private writable signals; expose readonly via asReadonly()
- Use `patchState()` - NEVER mutate state directly
- Async side effects use `withMethods` + RxJS inside store
## Bootstrap 5 Rules
- Use Bootstrap utility classes in templates - do NOT write custom CSS for spacing/layout
- Custom component styles go in the component's .scss file using Bootstrap SCSS variables
- Breakpoints: use Bootstrap's responsive utilities (col-md-6, d-none d-md-block, etc.)
- Import Bootstrap SCSS in styles/_variables.scss; never in component files
## File Naming
- Components: `user-list.component.ts`
- Stores: `users.store.ts`
- Services: `user-api.service.ts`
- Interfaces: `user.model.ts`
- Routes: `users.routes.ts`
## Git
- Branch naming: `feature/<ticket>-short-description`
- Never commit to main directly
- Run `ng lint && npx tsc --noEmit` before committing
## Approach
- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.
## IMPORTANT
- Never add `zone.js` imports - this project is fully zoneless
- Never use `NgModules` - standalone components only
- Never install new npm packages without confirming with the user first