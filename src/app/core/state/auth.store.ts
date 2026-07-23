import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Observable, catchError, finalize, map, of, switchMap, tap, throwError } from 'rxjs';

import { AuthApiService } from '../services/auth-api.service';
import { TokenStorageService } from '../services/token-storage.service';
import { toAuthErrorCode } from '../services/auth-error';
import { AuthErrorCode, AuthTokens, LoginCredentials, LoginResponse, User } from '../models/auth.model';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  // Vrai pendant un login ou un logout explicite (pilote l'UI du bouton).
  loading: boolean;
  // Passe a vrai une fois la restauration de session au demarrage terminee.
  // Les guards attendent ce drapeau avant de decider quoi que ce soit.
  initialized: boolean;
  error: AuthErrorCode | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  initialized: false,
  error: null,
};

/**
 * Source de verite unique de l'authentification pour toute l'application.
 *
 * Le store orchestre les appels API (AuthApiService), la persistance
 * (TokenStorageService) et l'etat en memoire. Les composants, guards et
 * l'interceptor lisent cet etat mais ne manipulent jamais les tokens ni le
 * localStorage directement.
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ user, accessToken }) => ({
    // Authentifie = un utilisateur ET un access token en memoire. Les deux sont
    // poses ensemble, donc l'un sans l'autre traduit un etat transitoire ou
    // corrompu que l'on considere comme non authentifie.
    isAuthenticated: computed(() => !!user() && !!accessToken()),
  })),

  withMethods(
    (
      store,
      api = inject(AuthApiService),
      storage = inject(TokenStorageService),
    ) => {
      /**
       * Ecrit les tokens en memoire ET dans le stockage persistant.
       * Point de passage unique pour toute mise a jour des tokens (login,
       * refresh, rejeu de l'interceptor), afin que memoire et persistance ne
       * divergent jamais.
       */
      function applyTokens(tokens: AuthTokens): void {
        patchState(store, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
        storage.setTokens(tokens);
      }

      /**
       * Ecrit l'utilisateur courant en memoire et dans le stockage.
       */
      function applyUser(user: User): void {
        patchState(store, { user });
        storage.setUser(user);
      }

      /**
       * Purge complete de la session : etat en memoire ET donnees persistees.
       * Ne declenche aucune navigation ni appel reseau ; c'est au code appelant
       * (logout, interceptor, guard) de rediriger si besoin. Idempotent.
       */
      function clearSession(): void {
        patchState(store, {
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        });
        storage.clear();
      }

      return {
        clearSession,

        /**
         * Expose la mise a jour des tokens a l'interceptor : apres un refresh
         * reussi hors du store (dans le flux de l'interceptor), on synchronise
         * memoire + persistance via ce point unique.
         */
        setTokens(tokens: AuthTokens): void {
          applyTokens(tokens);
        },

        /**
         * Connexion.
         *
         * Appelle POST /auth/login, persiste user + tokens, puis renvoie un
         * Observable<boolean> : true si connecte, false sinon. Le composant s'y
         * abonne pour naviguer uniquement en cas de succes. En cas d'echec,
         * l'erreur est traduite en code interne et stockee dans `error` (le
         * detail technique n'est jamais expose a l'UI).
         */
        login(credentials: LoginCredentials): Observable<boolean> {
          patchState(store, { loading: true, error: null });

          return api.login(credentials).pipe(
            tap((response: LoginResponse) => {
              applyTokens(response);
              applyUser(response.user);
              patchState(store, { loading: false });
            }),
            map(() => true),
            catchError((error: unknown) => {
              patchState(store, {
                loading: false,
                error: toAuthErrorCode(error),
              });
              // On absorbe l'erreur : le composant recoit un simple `false` et
              // n'a pas a gerer le flux d'erreur RxJS lui-meme.
              return of(false);
            }),
          );
        },

        /**
         * Deconnexion.
         *
         * Tente POST /auth/logout mais nettoie la session localement quoi qu'il
         * arrive : meme si l'appel echoue (reseau, 401...), l'utilisateur doit
         * etre deconnecte cote client. L'UI se met a jour immediatement via les
         * signals. Renvoie un Observable<void> qui complete apres nettoyage.
         */
        logout(): Observable<void> {
          patchState(store, { loading: true });

          return api.logout().pipe(
            // catchError avant le nettoyage : on transforme un eventuel echec
            // reseau en flux qui complete normalement, pour toujours nettoyer.
            catchError(() => of(void 0)),
            tap(() => {
              clearSession();
              patchState(store, { loading: false });
            }),
            map(() => void 0),
          );
        },

        /**
         * Rafraichit l'access token a partir du refresh token courant.
         *
         * Utilise par l'interceptor sur 401. Renvoie l'Observable du nouvel
         * access token. En l'absence de refresh token, ou si le refresh echoue,
         * la session est purgee et l'erreur est propagee (l'interceptor
         * declenchera alors la redirection vers /login).
         */
        refreshToken(): Observable<string> {
          const currentRefresh = store.refreshToken();

          if (!currentRefresh) {
            clearSession();
            return throwError(() => new Error('NO_REFRESH_TOKEN'));
          }

          return api.refresh(currentRefresh).pipe(
            tap((tokens) => applyTokens(tokens)),
            map((tokens) => tokens.accessToken),
            catchError((error: unknown) => {
              // Refresh token invalide ou expire : session terminee.
              clearSession();
              return throwError(() => error);
            }),
          );
        },

        /**
         * Recharge l'utilisateur courant via GET /auth/me et le stocke.
         * Sert a valider que la session persistee est toujours active cote
         * back-end. Renvoie l'utilisateur en cas de succes.
         */
        loadCurrentUser(): Observable<User> {
          return api.me().pipe(tap((user) => applyUser(user)));
        },

        /**
         * Restauration de session au demarrage de l'application.
         *
         * 1. Lit tokens + user depuis le stockage persistant (hydratation
         *    optimiste pour eviter un flash de deconnexion).
         * 2. Sans access token : session non restauree, on marque initialized.
         * 3. Avec access token : GET /auth/me pour valider cote serveur.
         * 4. Si /auth/me repond 401 : tentative de refresh puis nouveau /me.
         * 5. Tout echec du refresh : clearSession (l'utilisateur devra se
         *    reconnecter).
         *
         * Termine TOUJOURS en posant initialized = true, quel que soit le
         * resultat, pour debloquer le bootstrap et les guards. Ne propage
         * jamais d'erreur (l'initializer ne doit pas faire echouer le
         * demarrage).
         */
        restoreSession(): Observable<void> {
          const storedAccess = storage.getAccessToken();
          const storedRefresh = storage.getRefreshToken();
          const storedUser = storage.getUser();

          // Hydratation optimiste depuis le stockage avant validation serveur.
          patchState(store, {
            accessToken: storedAccess,
            refreshToken: storedRefresh,
            user: storedUser,
          });

          // Sans access token : rien a valider, session non restauree. On pose
          // initialized via l'operateur finalize commun ci-dessous.
          const validation$: Observable<void> = !storedAccess
            ? of(void 0)
            : api.me().pipe(
                tap((user) => applyUser(user)),
                map(() => void 0),
                catchError(() => {
                  // /auth/me a echoue (probable 401) : on tente un refresh unique.
                  if (!storedRefresh) {
                    clearSession();
                    return of(void 0);
                  }

                  return api.refresh(storedRefresh).pipe(
                    tap((tokens) => applyTokens(tokens)),
                    switchMap(() => api.me()),
                    tap((user) => applyUser(user)),
                    map(() => void 0),
                    catchError(() => {
                      // Refresh ou /me post-refresh en echec : session terminee.
                      clearSession();
                      return of(void 0);
                    }),
                  );
                }),
              );

          // finalize garantit initialized = true a la fin du flux quelle que
          // soit la branche empruntee (succes, refresh, echec total).
          return validation$.pipe(finalize(() => patchState(store, { initialized: true })));
        },
      };
    },
  ),
);
