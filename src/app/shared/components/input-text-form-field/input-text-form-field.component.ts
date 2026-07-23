import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// Champ de saisie reutilisable (label + input/textarea + erreur). Le parent
// passe son FormControl ; le style vient des classes globales (.rp-field /
// .rp-val / .field-error), le composant reste mince.
let nextFieldId = 0;

@Component({
  selector: 'app-input-text-form-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input-text-form-field.component.html',
  styleUrl: './input-text-form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextFormField {
  // Libelle du champ (obligatoire).
  readonly label = input.required<string>();

  // FormControl du parent, passe par reference : [control]="form.controls.email".
  readonly control = input.required<FormControl>();

  // Lie label[for] et input[id]. Genere si absent, pour l'accessibilite.
  readonly fieldId = input<string>(`rp-field-${nextFieldId++}`);

  // Type HTML de l'input. Ignore si multiline.
  readonly type = input<string>('text');

  // Rend un <textarea> au lieu d'un <input>.
  readonly multiline = input<boolean>(false);

  // Lignes du textarea (si multiline).
  readonly rows = input<number>(4);

  readonly autocomplete = input<string>();

  readonly placeholder = input<string>('');

  // 'floating' : label sur la bordure (defaut). 'static' : label au-dessus
  // (petites capitales, style connexion).
  readonly labelStyle = input<'floating' | 'static'>('floating');

  // Message affiche sous le champ quand il est touche et invalide.
  readonly errorMessage = input<string>();

  // Erreur visible seulement apres interaction.
  readonly showError = computed(() => {
    const c = this.control();
    return !!this.errorMessage() && c.touched && c.invalid;
  });
}
