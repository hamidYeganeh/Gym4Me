import type { ProgressPhotoItem } from "../../lib/progress-photos-data";

export type AthleteProgressPhotosScreenProps = {
  photos: ProgressPhotoItem[];
  pending?: boolean;
  onAddPhoto?: () => void | Promise<void>;
  className?: string;
};
