import { Injectable, Logger } from '@nestjs/common';

export interface IdentityCheckInput {
  phone: string;
  nationalId: string;
  birthDate: Date;
}

export interface IdentityCheckResult {
  approved: boolean;
  reason?: string;
  raw: Record<string, unknown>;
}

/** Identity verification provider (Shahkar / civil registry style). */
export abstract class KycProviderService {
  abstract verifyIdentity(
    input: IdentityCheckInput,
  ): Promise<IdentityCheckResult>;
}

/**
 * Mock driver: approves everything (national ID checksum is validated
 * upstream). Swap with a real provider (Finnotech/Jibit/...) via KYC_PROVIDER.
 */
@Injectable()
export class MockKycProviderService extends KycProviderService {
  private readonly logger = new Logger('MockKycProvider');

  async verifyIdentity(
    input: IdentityCheckInput,
  ): Promise<IdentityCheckResult> {
    this.logger.log(
      `[IDENTITY] phone=${input.phone} nationalId=${input.nationalId} → approved`,
    );
    return {
      approved: true,
      raw: {
        provider: 'mock',
        matchedAt: new Date().toISOString(),
        phoneOwnershipMatch: true,
        identityMatch: true,
      },
    };
  }
}
