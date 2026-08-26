import { MediaScanStatus } from '../common/enums';
import { MediaPurpose } from '../schemas/media.schema';

export const MANAGED_MEDIA_PURPOSES: readonly MediaPurpose[] = [
  MediaPurpose.PROGRESS_PHOTO,
  MediaPurpose.SOCIAL_POST,
  MediaPurpose.MEAL_ADHERENCE,
];

export function isManagedMediaPurpose(purpose: MediaPurpose): boolean {
  return MANAGED_MEDIA_PURPOSES.includes(purpose);
}

export function initialScanStatus(purpose: MediaPurpose): MediaScanStatus {
  return isManagedMediaPurpose(purpose)
    ? MediaScanStatus.PENDING_SCAN
    : MediaScanStatus.CLEAN;
}

export function resolveMediaScanStatus(media: {
  purpose?: MediaPurpose;
  scan?: { status?: MediaScanStatus };
}): MediaScanStatus {
  if (media.scan?.status) {
    return media.scan.status;
  }
  if (isManagedMediaPurpose(media.purpose ?? MediaPurpose.GENERAL)) {
    return MediaScanStatus.PENDING_SCAN;
  }
  return MediaScanStatus.CLEAN;
}

export function mediaScanAllowsServe(status: MediaScanStatus): boolean {
  return status === MediaScanStatus.CLEAN;
}

export function mediaScanAllowsClaim(status: MediaScanStatus): boolean {
  return status === MediaScanStatus.CLEAN;
}
