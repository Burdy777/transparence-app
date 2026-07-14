import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReportResult } from '../models/report.model';

export interface ReportFormValue {
  siteName: string;
  address: string;
  interventionDate: string;
  notes: string;
}

@Injectable({
  providedIn: 'root',
})
export class Reports {
  constructor(private http: HttpClient) {}

  create(form: ReportFormValue, beforePhotos: File[], afterPhotos: File[]): Observable<CreateReportResult> {
    const formData = new FormData();
    formData.append('siteName', form.siteName);
    formData.append('address', form.address);
    formData.append('interventionDate', form.interventionDate);
    formData.append('notes', form.notes);
    beforePhotos.forEach((file) => formData.append('beforePhotos', file));
    afterPhotos.forEach((file) => formData.append('afterPhotos', file));

    return this.http.post<CreateReportResult>(`${environment.apiBaseUrl}/reports`, formData);
  }
}
