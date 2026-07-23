import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Intervention } from '../models/intervention.model';

// Service HTTP type dedie aux interventions. Aucun appel HTTP ne vit dans le
// composant : le store passe par ce service (cf. contrainte "pas d'appels HTTP
// dans le composant"). Le JWT est ajoute automatiquement par l'auth-interceptor.
@Injectable({
  providedIn: 'root',
})
export class InterventionsService {
  private http = inject(HttpClient);

  // Interventions associees a l'agent connecte. Le backend deduit l'agent du
  // token ; on recoit un tableau brut [{ id, siteName, address }].
  list(): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${environment.apiBaseUrl}/interventions`);
  }
}
