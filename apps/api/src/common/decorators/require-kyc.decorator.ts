import { SetMetadata } from '@nestjs/common';

export const REQUIRE_KYC_KEY = 'requireKyc';

/**
 * Marks a route (or controller) as requiring an approved identity
 * verification (`user.kycStatus === approved`). Enforced by `KycGuard`;
 * failing requests get 403 with `code: 'KYC_REQUIRED'`.
 */
export const RequireKyc = () => SetMetadata(REQUIRE_KYC_KEY, true);
