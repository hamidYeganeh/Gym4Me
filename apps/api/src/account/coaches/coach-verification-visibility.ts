import { VerificationStatus } from '../../common/enums';
import type { QueryFilter } from 'mongoose';
import type { CoachProfileDocument } from '../../schemas/coach-profile.schema';

/**
 * Approved legacy profiles remain visible; newly structured credentials must
 * still be valid. This is additive and lets existing approved rows migrate
 * without an outage while preventing expired reviewed credentials from sale.
 */
export function approvedCoachVerificationFilter(
  now = new Date(),
): QueryFilter<CoachProfileDocument> {
  return {
    'verification.status': VerificationStatus.APPROVED,
    $or: [
      { 'verification.credential': { $exists: false } },
      { 'verification.credential.expiresAt': { $gt: now } },
    ],
  };
}
