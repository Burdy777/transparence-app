// Modele d'une anomalie signalee sur site. Prepare pour une future integration
// API (aucun appel backend n'existe encore cote anomalies).
export type AnomalySeverity = 'faible' | 'moyenne' | 'haute';

export interface AnomalyFormValue {
  siteName: string;
  address: string;
  severity: AnomalySeverity;
  comment: string;
}
