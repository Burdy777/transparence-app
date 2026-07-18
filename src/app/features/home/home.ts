import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home.scss',
})
export class Home {
  private auth = inject(Auth);
  private router = inject(Router);

  // Prenom de l'agent pour l'accueil, ou libelle neutre si non disponible.
  readonly agentName = computed(() => this.auth.currentAgent()?.name ?? 'Agent');

  logout(): void {
    // Confirmation avant deconnexion (exigence du parcours). window.confirm
    // suffit pour cette premiere version ; remplacable par un MatDialog plus
    // tard si un design dedie est demande.
    const confirmed = window.confirm('Se deconnecter ?');
    if (!confirmed) {
      return;
    }
    this.auth.logout();
    // replaceUrl : apres deconnexion, le login remplace l'accueil dans
    // l'historique (le bouton Retour ne doit pas revenir sur une page protegee).
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
