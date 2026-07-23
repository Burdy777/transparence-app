import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

// Page de confirmation affichee apres un envoi reussi (texte + photos avant +
// photos apres confirmes par le backend). Aucune logique : c'est un ecran de fin
// de parcours avec un lien de retour a l'accueil. Design aligne sur les cartes de
// marque de l'application (icone teintee, titre serif, CTA principal).
@Component({
  selector: 'app-report-confirmation',
  imports: [RouterLink, MatIconModule],
  templateUrl: './report-confirmation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './report-confirmation.scss',
})
export class ReportConfirmation {}
