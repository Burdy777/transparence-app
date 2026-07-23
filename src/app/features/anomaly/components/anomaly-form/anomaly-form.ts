import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AnomalySeverity } from '../../models/anomaly.model';

interface PhotoPreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-anomaly-form',
  imports: [ReactiveFormsModule, RouterLink, MatProgressBarModule],
  templateUrl: './anomaly-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './anomaly-form.scss',
})
export class AnomalyForm {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly photos = signal<PhotoPreview[]>([]);

  // Niveaux de gravite proposes. Le libelle est affiche, la valeur sert au form.
  readonly severities: { value: AnomalySeverity; label: string }[] = [
    { value: 'faible', label: 'Faible' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'haute', label: 'Haute' },
  ];

  readonly form = this.fb.group({
    siteName: ['', [Validators.required]],
    address: ['', [Validators.required]],
    severity: ['moyenne' as AnomalySeverity, [Validators.required]],
    comment: ['', [Validators.required]],
  });

  // Snapshot reactif des valeurs du formulaire : dans une app zoneless, un
  // template ne se rafraichit pas sur les changements de reactive form sans ce
  // pont RxJS -> signal. Sert a la barre de progression (meme pattern que
  // report-form).
  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  // Progression = 4 etapes obligatoires (chantier, adresse, commentaire, 1
  // photo). La gravite a toujours une valeur par defaut donc n'entre pas dans
  // le calcul.
  readonly progress = computed(() => {
    const value = this.formValue();
    const steps = [!!value.siteName, !!value.address, !!value.comment, this.photos().length > 0];
    const done = steps.filter(Boolean).length;
    return Math.round((done / steps.length) * 100);
  });

  // Message contextuel sous la barre : indique la prochaine action manquante.
  readonly progressLabel = computed(() => {
    const value = this.formValue();
    if (this.progress() === 100) {
      return 'Pret a enregistrer';
    }
    if (!value.siteName || !value.address) {
      return 'Completez la localisation';
    }
    if (!value.comment) {
      return 'Decrivez l anomalie';
    }
    if (this.photos().length === 0) {
      return 'Ajoutez une photo';
    }
    return 'Encore quelques informations';
  });

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    const previews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    this.photos.update((current) => [...current, ...previews]);
    input.value = '';
  }

  removePhoto(index: number): void {
    const removed = this.photos()[index];
    if (removed) {
      URL.revokeObjectURL(removed.url);
    }
    this.photos.update((current) => current.filter((_, i) => i !== index));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completez les champs obligatoires.');
      return;
    }

    // Pas d'appel backend : aucune API anomalie n'existe encore. On enregistre
    // localement pour que le signalement apparaisse dans l'historique, et on
    // prepare le terrain pour un futur service (voir models/anomaly.model.ts).
    // TODO(api): brancher un service Anomalies.create() multipart quand l'API
    // backend sera disponible, sur le modele de core/services/reports.ts.
    const value = this.form.getRawValue();
    this.saveToLocalHistory(value.siteName!, value.severity!);

    this.photos().forEach((p) => URL.revokeObjectURL(p.url));
    this.photos.set([]);
    this.form.reset({ severity: 'moyenne', comment: '' });
    this.submitted.set(true);
  }

  goHome(): void {
    this.router.navigate(['/accueil']);
  }

  // Enregistre le signalement dans le meme historique local que les
  // interventions, marque comme type "anomalie" pour distinction a l'affichage.
  private saveToLocalHistory(siteName: string, severity: AnomalySeverity): void {
    const key = 'chantier_app_local_history';
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
    existing.unshift({
      type: 'anomalie',
      siteName,
      severity,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
  }
}
