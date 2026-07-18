import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Agent, LoginResponse } from '../models/agent.model';

const TOKEN_KEY = 'chantier_app_token';
const AGENT_KEY = 'chantier_app_agent';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);

  readonly currentAgent = signal<Agent | null>(this.readStoredAgent());

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(AGENT_KEY, JSON.stringify(response.agent));
        this.currentAgent.set(response.agent);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AGENT_KEY);
    this.currentAgent.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private readStoredAgent(): Agent | null {
    const raw = localStorage.getItem(AGENT_KEY);
    return raw ? (JSON.parse(raw) as Agent) : null;
  }
}
