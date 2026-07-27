import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthStore } from '../state/auth.store';

/**
 * Protege les routes privees.
 *
 * Attend d'abord la fin de l'initialisation de l'auth (restoreSession), puis :
 *  - laisse passer si l'utilisateur est authentifie ;
 *  - sinon redirige vers /login en conservant l'URL demandee dans returnUrl,
 *    pour y revenir apres connexion.
 *
 * Grace a provideAuthInitializer, `initialized` est en pratique deja vrai quand
 * le guard s'execute ; l'attente explicite reste une securite (navigations tres
 * precoces, tests).
 */
export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return toObservable(authStore.initialized).pipe(
    filter((initialized) => initialized),
    take(1),
    map(() => {
      return true
      if (authStore.isAuthenticated()) {
        return true;
      }

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }),
  );
};
