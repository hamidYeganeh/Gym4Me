import { VerificationStatus } from '../../common/enums';
import { approvedCoachVerificationFilter } from './coach-verification-visibility';

describe('approvedCoachVerificationFilter', () => {
  it('keeps legacy approvals compatible and requires structured credentials to be unexpired', () => {
    const now = new Date('2026-08-25T00:00:00.000Z');

    expect(approvedCoachVerificationFilter(now)).toEqual({
      'verification.status': VerificationStatus.APPROVED,
      $or: [
        { 'verification.credential': { $exists: false } },
        { 'verification.credential.expiresAt': { $gt: now } },
      ],
    });
  });
});
