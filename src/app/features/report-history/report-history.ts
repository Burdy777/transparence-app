import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { UploadedPhoto } from '../../core/models/report.model';

interface LocalReportEntry {
  siteName: string;
  interventionDate: string;
  submittedAt: string;
  beforePhotos: UploadedPhoto[];
  afterPhotos: UploadedPhoto[];
}

const STORAGE_KEY = 'chantier_app_local_history';

@Component({
  selector: 'app-report-history',
  imports: [],
  templateUrl: './report-history.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './report-history.scss',
})
export class ReportHistory {
  readonly entries = signal<LocalReportEntry[]>(this.readEntries());

  private readEntries(): LocalReportEntry[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  }
}
