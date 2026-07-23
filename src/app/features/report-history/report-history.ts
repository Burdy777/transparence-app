import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UploadedPhoto } from '../../core/models/report.model';

// L'historique local melange desormais deux types d'entrees : les rapports
// d'intervention (avec photos avant/apres) et les signalements d'anomalie. Le
// champ "type" distingue les deux ; il est absent des anciennes entrees
// intervention (traitees comme 'intervention' par defaut).
interface InterventionEntry {
  type?: 'intervention';
  siteName: string;
  interventionDate: string;
  submittedAt: string;
  beforePhotos: UploadedPhoto[];
  afterPhotos: UploadedPhoto[];
}

interface AnomalyEntry {
  type: 'anomalie';
  siteName: string;
  severity: string;
  submittedAt: string;
}

type HistoryEntry = InterventionEntry | AnomalyEntry;

const STORAGE_KEY = 'chantier_app_local_history';

@Component({
  selector: 'app-report-history',
  imports: [RouterLink],
  templateUrl: './report-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './report-history.scss',
})
export class ReportHistory {
  readonly entries = signal<HistoryEntry[]>(this.readEntries());

  isAnomaly(entry: HistoryEntry): entry is AnomalyEntry {
    return entry.type === 'anomalie';
  }

  private readEntries(): HistoryEntry[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  }
}
