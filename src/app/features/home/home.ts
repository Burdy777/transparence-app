import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/state/auth.store';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home.scss',
})
export class Home {
  private authStore = inject(AuthStore);
  private router = inject(Router);

  // Prenom de l'utilisateur pour l'accueil, ou libelle neutre si indisponible.
  readonly agentName = computed(() => this.authStore.user()?.firstName ?? 'Agent');

  logout(): void {
    // Confirmation avant deconnexion (exigence du parcours). window.confirm
    // suffit pour cette premiere version ; remplacable par un MatDialog plus
    // tard si un design dedie est demande.
    const confirmed = window.confirm('Se deconnecter ?');
    if (!confirmed) {
      return;
    }
    // Le store nettoie la session (appel /auth/logout best-effort + purge
    // memoire/stockage). La redirection suit la fin du flux.
    this.authStore.logout().subscribe(() => {
      // replaceUrl : apres deconnexion, le login remplace l'accueil dans
      // l'historique (le bouton Retour ne doit pas revenir sur une page protegee).
      void this.router.navigate(['/login'], { replaceUrl: true });
    });
  }
}
