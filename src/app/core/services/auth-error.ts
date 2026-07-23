import { HttpErrorResponse } from '@angular/common/http';
import { AuthErrorCode } from '../models/auth.model';

/**
 * Traduit une erreur HTTP de login en code d'erreur interne.
 *
 * On ne remonte jamais le detail technique au store ni a l'UI : seul un code
 * stable est conserve, puis converti en message francais generique par
 * authErrorMessage(). Les details restent en console pour le debug.
 */
export function toAuthErrorCode(error: unknown): AuthErrorCode {
  if (!(error instanceof HttpErrorResponse)) {
    return 'UNKNOWN';
  }

  // status 0 : requete non aboutie (reseau coupe, CORS, back injoignable).
  if (error.status === 0) {
    return 'NETWORK';
  }

  switch (error.status) {
    case 401:
      return 'INVALID_CREDENTIALS';
    case 403:
      return 'ACCOUNT_DISABLED';
    case 404:
      return 'USER_NOT_FOUND';
    default:
      // 500, 502, 503, 504... : back-end indisponible ou en erreur.
      return error.status >= 500 ? 'SERVER_UNAVAILABLE' : 'UNKNOWN';
  }
}

// Messages destines a l'utilisateur. Francais sans accent, dans le style du
// reste de l'application. Aucun detail technique.
const MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  USER_NOT_FOUND: 'Email ou mot de passe incorrect.',
  ACCOUNT_DISABLED: 'Ce compte est desactive. Contactez votre administrateur.',
  SESSION_EXPIRED: 'Votre session a expire. Veuillez vous reconnecter.',
  NETWORK: 'Connexion au serveur impossible. Verifiez votre reseau.',
  SERVER_UNAVAILABLE: 'Service momentanement indisponible. Reessayez plus tard.',
  UNKNOWN: 'Une erreur est survenue. Reessayez plus tard.',
};

export function authErrorMessage(code: AuthErrorCode | null): string | null {
  return code ? MESSAGES[code] : null;
}
