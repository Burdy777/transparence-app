import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginCredentials, LoginResponse, RefreshResponse, User } from '../models/auth.model';

/**
 * Appels HTTP bruts vers le back-end principal pour l'authentification.
 *
 * Ce service ne detient aucun etat et ne persiste rien : il expose uniquement
 * les endpoints. L'orchestration (stockage, mise a jour de l'etat, navigation)
 * appartient au AuthStore.
 *
 * Le front ne parle jamais directement au microservice MS Auth : le back-end
 * principal fait le relais.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials);
  }

  // Le refresh token est transmis dans le corps. Cette requete est explicitement
  // ignoree par l'interceptor (pas de Bearer, pas de retry sur 401).
  refresh(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.baseUrl}/refresh`, { refreshToken });
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }
}
