import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    _input: IdentityCheckInput,
  ): Promise<IdentityCheckResult> {
    this.logger.log('[IDENTITY] mock verification completed → approved');
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

type ApiIrShahkarResponse = {
  data?: boolean;
  success?: boolean;
  code?: number;
  message?: string | null;
};

/** Phone ownership verification through api.ir's Shahkar endpoint. */
@Injectable()
export class ApiIrKycProviderService extends KycProviderService {
  private readonly logger = new Logger('ApiIrKycProvider');
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: ConfigService) {
    super();
    this.baseUrl = (
      config.get<string>('API_IR_BASE_URL') ?? 'https://s.api.ir'
    ).replace(/\/$/, '');
    this.apiKey = config.get<string>('API_IR_API_KEY', '').trim();
  }

  async verifyIdentity(
    input: IdentityCheckInput,
  ): Promise<IdentityCheckResult> {
    if (!this.apiKey) {
      throw new Error('errors.kycProviderNotConfigured');
    }

    const mobile = this.toLocalPhone(input.phone);
    const response = await fetch(`${this.baseUrl}/api/sw1/Shahkar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nationalCode: input.nationalId,
        mobile,
        isCompany: false,
      }),
    });
    const body = (await response
      .json()
      .catch(() => null)) as ApiIrShahkarResponse | null;

    if (!response.ok || !body || typeof body.data !== 'boolean') {
      this.logger.error(
        `api.ir Shahkar failed: http=${response.status} code=${body?.code ?? 'unknown'}`,
      );
      throw new Error('errors.kycProviderUnavailable');
    }

    return {
      // api.ir's Shahkar result is carried by `data`; some responses report
      // `success: false` even when the boolean result is present.
      approved: body.data,
      reason: body.data ? undefined : 'errors.shahkarMismatch',
      raw: {
        provider: 'api.ir-shahkar',
        data: body.data,
        success: body.success ?? null,
        code: body.code ?? null,
        message: body.message ?? null,
        checkedAt: new Date().toISOString(),
      },
    };
  }

  private toLocalPhone(phone: string): string {
    if (phone.startsWith('+98')) return `0${phone.slice(3)}`;
    if (phone.startsWith('98') && phone.length === 12) {
      return `0${phone.slice(2)}`;
    }
    return phone;
  }
}

type FinnotechTokenResponse = {
  result?: { value?: string; lifeTime?: number };
  status?: string;
  error?: { message?: string };
};

type FinnotechShahkarResponse = {
  result?: { isValid?: boolean | string };
  status?: string;
  trackId?: string;
  error?: { message?: string; code?: string };
};

/**
 * Shahkar (phone ↔ national ID ownership match) via the Finnotech aggregator.
 * Direct Shahkar access is restricted to licensed operators, so we go through
 * Finnotech's facility API with a client-credentials token.
 *
 * Env:
 *   FINNOTECH_BASE_URL           (default: https://api.finnotech.ir)
 *   FINNOTECH_CLIENT_ID
 *   FINNOTECH_CLIENT_SECRET
 *   FINNOTECH_CLIENT_NATIONAL_ID (legal entity national ID registered with Finnotech)
 */
@Injectable()
export class FinnotechKycProviderService extends KycProviderService {
  private static readonly SHAHKAR_SCOPE = 'facility:shahkar:get';

  private readonly logger = new Logger('FinnotechKycProvider');
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly clientNationalId: string;

  private cachedToken: { value: string; expiresAt: number } | null = null;
  private tokenPromise: Promise<string> | null = null;

  constructor(config: ConfigService) {
    super();
    this.baseUrl = (
      config.get<string>('FINNOTECH_BASE_URL') ?? 'https://api.finnotech.ir'
    ).replace(/\/$/, '');
    this.clientId = config.getOrThrow<string>('FINNOTECH_CLIENT_ID');
    this.clientSecret = config.getOrThrow<string>('FINNOTECH_CLIENT_SECRET');
    this.clientNationalId = config.getOrThrow<string>(
      'FINNOTECH_CLIENT_NATIONAL_ID',
    );
  }

  async verifyIdentity(
    input: IdentityCheckInput,
  ): Promise<IdentityCheckResult> {
    const mobile = this.toLocalPhone(input.phone);
    const data = await this.callShahkar(mobile, input.nationalId);

    const matched = this.isMatch(data.result?.isValid);
    if (!matched) {
      this.logger.log(
        `[SHAHKAR] mobile=${mobile} nationalId=${input.nationalId} → mismatch`,
      );
    }

    return {
      approved: matched,
      reason: matched
        ? undefined
        : 'شماره موبایل با کد ملی واردشده مطابقت ندارد (استعلام شاهکار)',
      raw: {
        provider: 'finnotech-shahkar',
        trackId: data.trackId ?? null,
        status: data.status ?? null,
        isValid: data.result?.isValid ?? null,
        checkedAt: new Date().toISOString(),
      },
    };
  }

  /** Shahkar returns `isValid` as boolean or `'yes'|'no'` depending on version. */
  private isMatch(isValid: boolean | string | undefined): boolean {
    if (typeof isValid === 'boolean') return isValid;
    if (typeof isValid === 'string') {
      return ['yes', 'true', '1'].includes(isValid.trim().toLowerCase());
    }
    return false;
  }

  private toLocalPhone(phone: string): string {
    // Shahkar expects local format: +98912… → 0912…
    if (phone.startsWith('+98')) return `0${phone.slice(3)}`;
    if (phone.startsWith('98') && phone.length === 12) {
      return `0${phone.slice(2)}`;
    }
    return phone;
  }

  private async callShahkar(
    mobile: string,
    nationalId: string,
  ): Promise<FinnotechShahkarResponse> {
    const token = await this.getToken();
    const trackId = crypto.randomUUID();
    const params = new URLSearchParams({
      mobile,
      nationalCode: nationalId,
      trackId,
    });
    const url = `${this.baseUrl}/facility/v2/clients/${this.clientId}/shahkar/verify?${params.toString()}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = (await res
      .json()
      .catch(() => null)) as FinnotechShahkarResponse | null;

    if (!res.ok || !body || body.status === 'FAILED') {
      this.logger.error(
        `Shahkar inquiry failed: http=${res.status} body=${JSON.stringify(body)}`,
      );
      throw new Error('Shahkar inquiry failed');
    }
    return body;
  }

  private getToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return Promise.resolve(this.cachedToken.value);
    }
    if (!this.tokenPromise) {
      this.tokenPromise = this.fetchToken().finally(() => {
        this.tokenPromise = null;
      });
    }
    return this.tokenPromise;
  }

  private async fetchToken(): Promise<string> {
    const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );

    const res = await fetch(`${this.baseUrl}/dev/v2/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        nid: this.clientNationalId,
        scopes: FinnotechKycProviderService.SHAHKAR_SCOPE,
      }),
    });
    const body = (await res
      .json()
      .catch(() => null)) as FinnotechTokenResponse | null;
    const token = body?.result?.value;

    if (!res.ok || !token) {
      this.logger.error(
        `Finnotech token failed: http=${res.status} error=${body?.error?.message ?? 'unknown'}`,
      );
      throw new Error('Finnotech token request failed');
    }

    // lifeTime is in ms; refresh one hour early to avoid edge expiry.
    const lifeTimeMs = body?.result?.lifeTime ?? 24 * 60 * 60 * 1000;
    this.cachedToken = {
      value: token,
      expiresAt: Date.now() + Math.max(lifeTimeMs - 60 * 60 * 1000, 60_000),
    };
    return token;
  }
}
