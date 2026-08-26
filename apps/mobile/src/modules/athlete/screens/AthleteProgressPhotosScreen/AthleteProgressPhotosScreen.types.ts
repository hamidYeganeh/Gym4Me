import type { ProgressPhotoItem } from "../../lib/progress-photos-data";

export type AthleteProgressPhotosScreenProps = {
  photos: ProgressPhotoItem[];
  pending?: boolean;
  loading?: boolean;
  error?: boolean;
  onAddPhoto?: (file: File) => void | Promise<void>;
  onDeletePhoto?: (id: string) => void | Promise<void>;
  onPrivacyChange?: (
    id: string,
    privacy: ProgressPhotoItem['privacy'],
  ) => void | Promise<void>;
  pendingPhotoId?: string | null;
  onRetry?: () => void | Promise<void>;
  className?: string;
};
