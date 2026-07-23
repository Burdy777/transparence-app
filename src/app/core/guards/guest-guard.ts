import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthStore } from '../state/auth.store';

/**
 * Empeche l'acces a /login quand un utilisateur est deja connecte : il est
 * renvoye vers l'accueil. Complementaire de authGuard (qui protege les pages
 * internes).
 *
 * Attend la fin de l'initialisation avant de decider, pour ne pas laisser
 * apparaitre le formulaire de connexion a un utilisateur dont la session est en
 * cours de restauration.
 */
export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return toObservable(authStore.initialized).pipe(
    filter((initialized) => initialized),
    take(1),
    map(() => (authStore.isAuthenticated() ? router.createUrlTree(['/accueil']) : true)),
  );
};
