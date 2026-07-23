export interface UploadedPhoto {
  fileId: string;
  fileName: string;
  webViewLink: string;
}

export interface CreateReportResult {
  message: string;
  beforePhotos: UploadedPhoto[];
  afterPhotos: UploadedPhoto[];
}

// Forme d'une reponse d'erreur "metier" du backend. `message` alimente la
// snackbar globale ; `fieldErrors` (optionnel) permet de reporter des erreurs
// precises sous les controles du formulaire via setErrors (cf. section erreurs).
// Les cles attendues correspondent aux controles : interventionId, notes,
// beforePhotos, afterPhotos.
export interface ReportErrorResponse {
  message?: string;
  fieldErrors?: Record<string, string>;
}
