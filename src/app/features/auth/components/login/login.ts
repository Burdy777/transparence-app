import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../../../../core/state/auth.store';
import { authErrorMessage } from '../../../../core/services/auth-error';
import { InputTextFormField } from '../../../../shared/components/input-text-form-field/input-text-form-field.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputTextFormField],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Etat de chargement et erreur proviennent du store : le composant ne porte
  // aucune logique metier d'authentification, il ne fait que refleter l'etat.
  readonly loading = this.authStore.loading;
  readonly errorMessage = computed(() => authErrorMessage(this.authStore.error()));

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    void this.router.navigateByUrl('/accueil', { replaceUrl: true });
    return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.authStore.login({ email: email!, password: password! }).subscribe((success) => {
      if (!success) {
        // L'erreur est deja dans le store (affichee via errorMessage). On reste
        // sur la page de connexion.
        return;
      }

      // returnUrl : si le guard a redirige ici depuis une page protegee, on y
      // retourne apres connexion ; sinon accueil par defaut.
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/accueil';
      // replaceUrl : la connexion ne doit pas rester dans l'historique. Apres
      // login, le bouton Retour du navigateur/telephone ne doit pas ramener
      // ici (cf. parcours mobile).
      void this.router.navigateByUrl(returnUrl, { replaceUrl: true });
    });
  }
}
