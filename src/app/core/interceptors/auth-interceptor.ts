import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthStore } from '../state/auth.store';

// Routes d'authentification qui ne doivent NI recevoir de Bearer NI declencher
// un retry sur 401 (sinon boucle infinie : un login/refresh en 401 relancerait
// un refresh).
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh'];

// Etat partage au niveau module entre toutes les requetes qui traversent
// l'interceptor. Il garantit qu'un seul refresh part a la fois, meme si
// plusieurs requetes recoivent 401 simultanement.
//
// isRefreshing : un refresh est-il deja en cours ?
// refreshedToken$ : diffuse le nouvel access token aux requetes en attente.
//   null tant que le refresh n'a pas abouti ; les requetes concurrentes
//   attendent une valeur non nulle avant de rejouer.
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

function withBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Les endpoints d'auth passent tels quels, sans Bearer et sans retry.
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const accessToken = authStore.accessToken();
  const authReq = accessToken ? withBearer(req, accessToken) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      // On ne traite que les 401 sur des requetes deja porteuses d'un token :
      // sans token, un 401 n'est pas un probleme d'expiration a rejouer.
      if (error instanceof HttpErrorResponse && error.status === 401 && accessToken) {
        return handle401(authReq, next, authStore, router);
      }
      return throwError(() => error);
    }),
  );
};

/**
 * Gere une reponse 401 : refresh unique + mise en attente des requetes
 * concurrentes, puis rejeu.
 */
function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authStore: {
    refreshToken: () => Observable<string>;
    clearSession: () => void;
  },
  router: Router,
): Observable<HttpEvent<unknown>> {
  // Cas 1 : aucun refresh en cours -> cette requete declenche LE refresh.
  if (!isRefreshing) {
    isRefreshing = true;
    // On remet le sujet a null : les requetes concurrentes qui arrivent
    // maintenant attendront la prochaine valeur non nulle.
    refreshedToken$.next(null);

    return authStore.refreshToken().pipe(
      switchMap((newToken) => {
        // Refresh reussi : on debloque les requetes en attente puis on rejoue.
        isRefreshing = false;
        refreshedToken$.next(newToken);
        return next(withBearer(req, newToken));
      }),
      catchError((error: unknown) => {
        // Refresh echoue : session deja purgee par le store. On debloque les
        // requetes en attente (elles echoueront a leur tour) et on redirige.
        isRefreshing = false;
        refreshedToken$.next(null);
        authStore.clearSession();
        void router.navigate(['/login']);
        return throwError(() => error);
      }),
    );
  }

  // Cas 2 : un refresh est deja en cours -> on attend le nouveau token sans
  // relancer d'appel /auth/refresh, puis on rejoue la requete une seule fois.
  return refreshedToken$.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(withBearer(req, token))),
  );
}
