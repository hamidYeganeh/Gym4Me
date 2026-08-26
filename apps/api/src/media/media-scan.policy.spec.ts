import { MediaScanStatus } from '../common/enums';
import { MediaPurpose } from '../schemas/media.schema';
import {
  initialScanStatus,
  isManagedMediaPurpose,
  mediaScanAllowsClaim,
  mediaScanAllowsServe,
  resolveMediaScanStatus,
} from './media-scan.policy';

describe('media-scan.policy', () => {
  it('treats managed purposes as scan-gated', () => {
    expect(isManagedMediaPurpose(MediaPurpose.PROGRESS_PHOTO)).toBe(true);
    expect(isManagedMediaPurpose(MediaPurpose.GENERAL)).toBe(false);
    expect(initialScanStatus(MediaPurpose.SOCIAL_POST)).toBe(
      MediaScanStatus.PENDING_SCAN,
    );
    expect(initialScanStatus(MediaPurpose.GENERAL)).toBe(MediaScanStatus.CLEAN);
  });

  it('defaults legacy managed media without scan metadata to pending', () => {
    expect(
      resolveMediaScanStatus({ purpose: MediaPurpose.MEAL_ADHERENCE }),
    ).toBe(MediaScanStatus.PENDING_SCAN);
    expect(resolveMediaScanStatus({ purpose: MediaPurpose.GENERAL })).toBe(
      MediaScanStatus.CLEAN,
    );
  });

  it('allows serve and claim only for clean media', () => {
    expect(mediaScanAllowsServe(MediaScanStatus.CLEAN)).toBe(true);
    expect(mediaScanAllowsServe(MediaScanStatus.PENDING_SCAN)).toBe(false);
    expect(mediaScanAllowsClaim(MediaScanStatus.QUARANTINED)).toBe(false);
  });
});
