export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Corps renvoye par POST /auth/login.
export interface LoginResponse extends AuthTokens {
  user: User;
  // Duree de vie de l'access token en secondes. Non exploite pour l'instant
  // (le refresh est declenche a la volee sur 401), conserve pour une future
  // strategie de refresh proactif.
  expiresIn: number;
}

// Corps renvoye par POST /auth/refresh.
export interface RefreshResponse extends AuthTokens {
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Codes d'erreur internes. Ne sont jamais affiches tels quels : le composant
// les traduit en message francais generique (cf. auth-error.ts).
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'ACCOUNT_DISABLED'
  | 'SESSION_EXPIRED'
  | 'NETWORK'
  | 'SERVER_UNAVAILABLE'
  | 'UNKNOWN';
