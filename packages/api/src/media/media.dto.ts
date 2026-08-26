export type MediaScanStatus =
  | 'pending_scan'
  | 'clean'
  | 'infected'
  | 'scan_failed'
  | 'quarantined';

export type MediaAsset = {
  id: string;
  mimeType: string;
  size: number;
  hash: string | null;
  originalName: string | null;
  visibility: 'public' | 'private';
  purpose: 'general' | 'progress_photo' | 'social_post' | 'meal_adherence';
  scanStatus: MediaScanStatus;
  url: string;
  createdAt: string;
};

export type MediaUploadOptions = {
  visibility?: 'public' | 'private';
  purpose?: 'general' | 'progress_photo' | 'social_post' | 'meal_adherence';
};
