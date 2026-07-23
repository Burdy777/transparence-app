import { inject, provideAppInitializer } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from './state/auth.store';

/**
 * Initializer applicatif : restaure la session avant que l'application ne
 * s'affiche.
 *
 * provideAppInitializer bloque le bootstrap tant que la promesse renvoyee n'est
 * pas resolue. On attend donc la fin de restoreSession() (validation /auth/me
 * et eventuel refresh) pour eviter :
 *  - une redirection incorrecte au chargement,
 *  - l'affichage furtif d'une page protegee,
 *  - une perte de session au rechargement.
 *
 * restoreSession() ne rejette jamais (il pose toujours initialized = true),
 * donc le demarrage ne peut pas echouer a cause de l'auth.
 */
export const provideAuthInitializer = () =>
  provideAppInitializer(() => {
    const authStore = inject(AuthStore);
    return firstValueFrom(authStore.restoreSession());
  });
