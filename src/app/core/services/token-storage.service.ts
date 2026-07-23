import { Injectable } from '@angular/core';
import { AuthTokens, User } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Unique point d'acces a la persistance des donnees d'authentification.
 *
 * Aucun composant, guard, interceptor ou store ne doit lire ou ecrire
 * directement dans localStorage : tout passe par ce service. Cette isolation
 * permet de migrer plus tard vers des cookies HttpOnly en ne modifiant que ce
 * fichier (la surface publique reste identique).
 *
 * Le store reste la source de verite en memoire ; ce service sert uniquement
 * a survivre au rechargement de la page.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  getAccessToken(): string | null {
    return this.read(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.read(REFRESH_TOKEN_KEY);
  }

  getUser(): User | null {
    const raw = this.read(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      // Donnee corrompue : on repart d'un etat propre plutot que de crasher.
      this.clear();
      return null;
    }
  }

  setTokens(tokens: AuthTokens): void {
    this.write(ACCESS_TOKEN_KEY, tokens.accessToken);
    this.write(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  setUser(user: User): void {
    this.write(USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    this.remove(ACCESS_TOKEN_KEY);
    this.remove(REFRESH_TOKEN_KEY);
    this.remove(USER_KEY);
  }

  // Acces bas niveau enrobes dans un try/catch : en navigation privee ou avec
  // le stockage desactive, localStorage peut lever. On degrade sans planter.
  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Persistance indisponible : la session vivra en memoire uniquement.
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Rien a faire : l'objectif (absence de la cle) est deja atteint.
    }
  }
}
