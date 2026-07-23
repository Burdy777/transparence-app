import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReportResult } from '../models/report.model';

// Donnees texte du rapport. Le nom du site et l'adresse ne sont PAS envoyes : le
// backend les retrouve a partir de interventionId (source unique de coherence).
export interface ReportFormValue {
  interventionId: string;
  interventionDate: string;
  notes: string;
}

@Injectable({
  providedIn: 'root',
})
export class Reports {
  private http = inject(HttpClient);

  // Envoi UNIQUE (texte + photos) en une seule requete multipart. On n'ajoute
  // jamais le header Content-Type a la main : le navigateur genere lui-meme le
  // multipart/form-data avec sa boundary. L'auth-interceptor ajoute le JWT.
  create(
    form: ReportFormValue,
    beforePhotos: File[],
    afterPhotos: File[],
  ): Observable<CreateReportResult> {
    const formData = new FormData();
    formData.append('interventionId', form.interventionId);
    formData.append('interventionDate', form.interventionDate);
    formData.append('notes', form.notes);
    beforePhotos.forEach((file) => formData.append('beforePhotos', file));
    afterPhotos.forEach((file) => formData.append('afterPhotos', file));

    return this.http.post<CreateReportResult>(`${environment.apiBaseUrl}/reports`, formData);
  }
}
