// Intervention affectee a l'agent connecte, telle que renvoyee par le backend
// (mockee cote back pour l'instant). Le nom du site et l'adresse proviennent du
// MEME objet : c'est ce qui garantit la coherence entre les deux listes
// deroulantes du formulaire (voir report-form). Seul `id` est envoye au backend
// lors de la creation du rapport.
export interface Intervention {
  id: string;
  siteName: string;
  address: string;
}
