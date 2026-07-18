import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Reports } from '../../../../core/services/reports';
import { CreateReportResult } from '../../../../core/models/report.model';

interface PhotoPreview {
  file: File;
  url: string;
}

function todayIsoDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

@Component({
  selector: 'app-report-form',
  imports: [ReactiveFormsModule],
  templateUrl: './report-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './report-form.scss',
})
export class ReportForm {
  private fb = inject(FormBuilder);
  private reports = inject(Reports);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly result = signal<CreateReportResult | null>(null);

  readonly beforePhotos = signal<PhotoPreview[]>([]);
  readonly afterPhotos = signal<PhotoPreview[]>([]);

  readonly form = this.fb.group({
    siteName: ['', [Validators.required]],
    address: ['', [Validators.required]],
    interventionDate: [todayIsoDate(), [Validators.required]],
    notes: [''],
  });

  onFilesSelected(event: Event, category: 'before' | 'after'): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    const previews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));

    const target = category === 'before' ? this.beforePhotos : this.afterPhotos;
    target.update((current) => [...current, ...previews]);
    input.value = '';
  }

  removePhoto(category: 'before' | 'after', index: number): void {
    const target = category === 'before' ? this.beforePhotos : this.afterPhotos;
    const removed = target()[index];
    if (removed) {
      URL.revokeObjectURL(removed.url);
    }
    target.update((current) => current.filter((_, i) => i !== index));
  }

  submit(): void {
    if (this.form.invalid || this.beforePhotos().length === 0 || this.afterPhotos().length === 0) {
      this.form.markAllAsTouched();
      this.errorMessage.set(
        this.beforePhotos().length === 0 || this.afterPhotos().length === 0
          ? 'Au moins une photo avant et une photo apres sont requises.'
          : null,
      );
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.result.set(null);

    const formValue = this.form.getRawValue();

    this.reports
      .create(
        {
          siteName: formValue.siteName!,
          address: formValue.address!,
          interventionDate: formValue.interventionDate!,
          notes: formValue.notes ?? '',
        },
        this.beforePhotos().map((p) => p.file),
        this.afterPhotos().map((p) => p.file),
      )
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.result.set(res);
          this.saveToLocalHistory(formValue.siteName!, formValue.interventionDate!, res);
          this.resetForm();
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set("Echec de l'envoi du rapport. Verifiez votre connexion et reessayez.");
        },
      });
  }

  private resetForm(): void {
    this.beforePhotos().forEach((p) => URL.revokeObjectURL(p.url));
    this.afterPhotos().forEach((p) => URL.revokeObjectURL(p.url));
    this.beforePhotos.set([]);
    this.afterPhotos.set([]);
    this.form.reset({ interventionDate: todayIsoDate(), notes: '' });
  }

  private saveToLocalHistory(siteName: string, interventionDate: string, result: CreateReportResult): void {
    const key = 'chantier_app_local_history';
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
    existing.unshift({
      siteName,
      interventionDate,
      submittedAt: new Date().toISOString(),
      beforePhotos: result.beforePhotos,
      afterPhotos: result.afterPhotos,
    });
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
  }
}
