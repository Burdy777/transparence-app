# Enterprise Angular App — Claude Code Context

## Stack
- Angular 22 with standalone components and zoneless change detection
- NgRx SignalStore (@ngrx/signals) for all shared/feature state
- Bootstrap 5.3 via SCSS - NO Angular Material, NO Tailwind
- RxJS for async operations; convert to signals at component boundary with toSignal()
- TypeScript strict mode enforced
## Project Layout
See @src/app/ for feature modules. Each feature has: components/, state/, services/, *.routes.ts
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
## IMPORTANT
- Never add `zone.js` imports - this project is fully zoneless
- Never use `NgModules` - standalone components only
- Never install new npm packages without confirming with the user first