import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Empeche l'acces a /login quand un agent est deja connecte : il est renvoye
// vers l'accueil. Complementaire de authGuard (qui protege les pages internes).
export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/accueil']);
};
