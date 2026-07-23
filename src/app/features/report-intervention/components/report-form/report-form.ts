import {
  Component,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  ElementRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Reports } from '../../../../core/services/reports';
import { ReportErrorResponse } from '../../../../core/models/report.model';
import { ReportInterventionStore } from '../../state/report-intervention.store';

interface PhotoPreview {
  file: File;
  url: string;
}

// Contraintes photo du projet. Centralisees ici pour la validation ET les
// messages d'erreur, afin de rester coherent avec les regles annoncees.
const MAX_PHOTOS = 10;
const MIN_PHOTOS = 1;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo par fichier
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

function todayIsoDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

@Component({
  selector: 'app-report-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './report-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './report-form.scss',
})
export class ReportForm {
  private fb = inject(FormBuilder);
  private reports = inject(Reports);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  // Store expose en lecture au template (etats de chargement des interventions).
  protected readonly store = inject(ReportInterventionStore);

  readonly loading = signal(false);
  // Message d'erreur photo global affiche sous les blocs (complement des erreurs
  // par-champ). La snackbar sert aux erreurs d'ENVOI ; ce signal aux erreurs de
  // validation locale des photos.
  readonly photoError = signal<string | null>(null);

  readonly beforePhotos = signal<PhotoPreview[]>([]);
  readonly afterPhotos = signal<PhotoPreview[]>([]);

  readonly maxPhotos = MAX_PHOTOS;

  readonly form = this.fb.group({
    // interventionId est LE champ envoye au backend. siteName/address sont des
    // controles d'UI (les deux listes) : ils doivent rester coherents mais ne
    // sont pas transmis tels quels. On valide interventionId (source de verite).
    interventionId: ['', [Validators.required]],
    siteName: ['', [Validators.required]],
    address: ['', [Validators.required]],
    interventionDate: [todayIsoDate(), [Validators.required]],
    notes: [''],
  });

  constructor() {
    // Chargement des interventions a l'arrivee sur la page.
    this.store.load();

    // Synchronise les selects avec l'intervention selectionnee dans le store.
    // Choisir un nom de site OU une adresse revient a selectionner une
    // intervention ; on re-projette alors les DEUX valeurs depuis l'objet
    // intervention, ce qui rend impossible un couple site/adresse depareille.
    effect(() => {
      const itv = this.store.selectedIntervention();
      const controls = this.form.controls;
      if (itv) {
        // emitEvent:false : on met a jour les controles sans relancer une
        // nouvelle selection (evite une boucle avec les (selectionChange)).
        controls.interventionId.setValue(itv.id, { emitEvent: false });
        controls.siteName.setValue(itv.id, { emitEvent: false });
        controls.address.setValue(itv.id, { emitEvent: false });
      }
    });
  }

  // Snapshot reactif des valeurs du formulaire : app zoneless, meme pont
  // RxJS -> signal que les autres formulaires du projet. Alimente l'entete et la
  // barre de progression.
  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  // Progression = 4 etapes obligatoires (intervention choisie, date, 1 photo
  // avant, 1 photo apres). Les notes sont optionnelles.
  readonly progress = computed(() => {
    const value = this.formValue();
    const steps = [
      !!value.interventionId,
      !!value.interventionDate,
      this.beforePhotos().length > 0,
      this.afterPhotos().length > 0,
    ];
    const done = steps.filter(Boolean).length;
    return Math.round((done / steps.length) * 100);
  });

  readonly progressLabel = computed(() => {
    const value = this.formValue();
    if (this.progress() === 100) {
      return 'Pret a envoyer';
    }
    if (!value.interventionId) {
      return 'Choisissez le chantier';
    }
    if (this.beforePhotos().length === 0) {
      return 'Ajoutez une photo avant';
    }
    if (this.afterPhotos().length === 0) {
      return 'Plus qu une photo apres pour terminer';
    }
    return 'Encore quelques informations';
  });

  // Titre de l'entete : nom du chantier selectionne, ou libelle par defaut.
  readonly headerTitle = computed(
    () => this.store.selectedIntervention()?.siteName ?? 'Nouveau chantier',
  );

  // Appele par les deux (selectionChange). Quel que soit le select touche, la
  // valeur transportee est l'id d'intervention : on delegue au store, l'effect
  // se charge de re-synchroniser l'autre liste.
  onInterventionChange(id: string): void {
    this.store.select(id);
  }

  onFilesSelected(event: Event, category: 'before' | 'after'): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (files.length === 0) {
      return;
    }

    const target = category === 'before' ? this.beforePhotos : this.afterPhotos;
    const label = category === 'before' ? 'avant' : 'apres';

    // Validation format + taille fichier par fichier ; on n'ajoute que les
    // fichiers valides et on signale les rejets.
    const valid: PhotoPreview[] = [];
    for (const file of files) {
      if (!this.isAllowedType(file)) {
        this.photoError.set(`Format non supporte pour "${file.name}". Utilisez JPG, PNG ou WEBP.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        this.photoError.set(`"${file.name}" depasse la taille maximale de 10 Mo.`);
        continue;
      }
      valid.push({ file, url: URL.createObjectURL(file) });
    }

    // Respect du plafond de 10 photos par categorie.
    const room = MAX_PHOTOS - target().length;
    if (valid.length > room) {
      valid.slice(room).forEach((p) => URL.revokeObjectURL(p.url));
      this.photoError.set(`Maximum ${MAX_PHOTOS} photos ${label}. Les photos en trop ont ete ignorees.`);
    }

    const accepted = valid.slice(0, Math.max(0, room));
    if (accepted.length > 0) {
      target.update((current) => [...current, ...accepted]);
      // Une saisie valide efface le message d'erreur photo precedent (local ou
      // renvoye par le backend) : la categorie vient de recevoir une photo valide.
      this.photoError.set(null);
    }
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
    // 1. Marquer tous les controles comme touches pour reveler les erreurs.
    this.form.markAllAsTouched();
    this.photoError.set(null);

    // 4-6. Validation des photos (min 1 avant, min 1 apres, plafonds).
    const photosValid = this.validatePhotos();

    // 2-3. Validation des champs texte + coherence intervention (garantie par
    // construction : siteName/address/interventionId partagent le meme id).
    if (this.form.invalid || !photosValid) {
      // 8. Amener l'utilisateur vers la premiere erreur affichee.
      this.scrollToFirstError();
      return;
    }

    // 9. On n'appelle le backend que si tout est valide.
    this.loading.set(true);

    const raw = this.form.getRawValue();

    this.reports
      .create(
        {
          interventionId: raw.interventionId!,
          interventionDate: raw.interventionDate!,
          notes: raw.notes ?? '',
        },
        this.beforePhotos().map((p) => p.file),
        this.afterPhotos().map((p) => p.file),
      )
      .subscribe({
        // 6. Succes complet uniquement : le backend ne repond qu'apres avoir
        // confirme texte + photos avant + photos apres (orchestration cote back).
        next: () => {
          this.loading.set(false);
          this.cleanupObjectUrls();
          this.store.clearSelection();
          // 7. Redirection vers la page de confirmation dediee.
          this.router.navigate(['/rapport-confirme']);
        },
        // 8. Echec : on reste sur le formulaire, champs et photos conserves.
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.handleBackendError(err);
        },
      });
  }

  // ---- Validation photos ----------------------------------------------------
  // Les photos vivent dans des signaux (pas des controles reactifs) : leur
  // validation s'exprime donc ici et le message s'affiche via photoError sous
  // les blocs. Les erreurs par-champ backend sont, elles, posees via setErrors.
  private validatePhotos(): boolean {
    if (this.beforePhotos().length < MIN_PHOTOS) {
      this.photoError.set('Ajoutez au moins une photo avant intervention.');
      return false;
    }
    if (this.afterPhotos().length < MIN_PHOTOS) {
      this.photoError.set('Ajoutez au moins une photo apres intervention.');
      return false;
    }
    if (this.beforePhotos().length > MAX_PHOTOS || this.afterPhotos().length > MAX_PHOTOS) {
      this.photoError.set(`Maximum ${MAX_PHOTOS} photos par categorie.`);
      return false;
    }
    return true;
  }

  private isAllowedType(file: File): boolean {
    // On accepte tout image/* par tolerance mobile, mais on valide une liste
    // connue en priorite (certains navigateurs renvoient un type vide pour HEIC).
    return ALLOWED_TYPES.includes(file.type) || file.type.startsWith('image/');
  }

  // ---- Gestion des erreurs backend ------------------------------------------
  // Reporte les erreurs par-champ via setErrors et affiche un message global
  // dans une snackbar rouge. Le message global ne remplace pas les erreurs
  // detaillees sous les champs.
  private handleBackendError(err: HttpErrorResponse): void {
    const body = (err.error ?? {}) as ReportErrorResponse;
    const fieldErrors = body.fieldErrors;

    if (fieldErrors) {
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (field === 'beforePhotos' || field === 'afterPhotos') {
          // Pas de controle Angular dedie aux photos : on remonte le message
          // dans photoError pour l'afficher sous les blocs concernes.
          this.photoError.set(message);
          continue;
        }
        const control = this.form.get(field);
        control?.setErrors({ server: message });
        control?.markAsTouched();
      }
      this.scrollToFirstError();
    }

    const globalMessage =
      body.message ?? "Echec de l'envoi du rapport. Verifiez votre connexion et reessayez.";
    this.snackBar.open(globalMessage, 'Fermer', {
      duration: 6000,
      panelClass: 'rp-snack-error',
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  // Message d'erreur serveur eventuel attache a un controle (pour le template).
  serverError(control: AbstractControl | null): string | null {
    const err = control?.errors?.['server'];
    return typeof err === 'string' ? err : null;
  }

  // ---- Utilitaires ----------------------------------------------------------
  private scrollToFirstError(): void {
    // Priorite au message photo (hors flux Material), sinon premier champ
    // invalide. requestAnimationFrame : laisse Angular peindre les etats
    // d'erreur avant de mesurer/scroller.
    requestAnimationFrame(() => {
      const el = this.host.nativeElement;
      const invalid =
        el.querySelector<HTMLElement>('.rp-photo-error') ??
        el.querySelector<HTMLElement>('mat-form-field.ng-invalid') ??
        el.querySelector<HTMLElement>('.ng-invalid');
      invalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  private cleanupObjectUrls(): void {
    this.beforePhotos().forEach((p) => URL.revokeObjectURL(p.url));
    this.afterPhotos().forEach((p) => URL.revokeObjectURL(p.url));
    this.beforePhotos.set([]);
    this.afterPhotos.set([]);
  }
}
