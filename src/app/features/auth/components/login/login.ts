import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        // replaceUrl : la connexion ne doit pas rester dans l'historique. Apres
        // login, le bouton Retour du navigateur/telephone ne doit pas ramener
        // ici (cf. parcours mobile).
        this.router.navigate(['/accueil'], { replaceUrl: true });
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Email ou mot de passe incorrect.');
      },
    });
  }
}
