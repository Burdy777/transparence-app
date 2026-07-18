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
