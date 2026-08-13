import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type KavenegarResponse = {
  return?: { status?: number; message?: string };
};

export abstract class SmsService {
  abstract sendOtp(phone: string, code: string): Promise<void>;
  abstract sendInvite(
    phone: string,
    inviterName: string,
    referralCode: string,
  ): Promise<void>;
  abstract sendTemplate(
    phone: string,
    template: string,
    tokens: string[],
  ): Promise<void>;
}

@Injectable()
export class MockSmsService extends SmsService {
  private readonly logger = new Logger('MockSms');

  sendOtp(phone: string, code: string): Promise<void> {
    this.logger.log(`[OTP] to=${phone} code=${code}`);
    return Promise.resolve();
  }

  sendInvite(
    phone: string,
    inviterName: string,
    referralCode: string,
  ): Promise<void> {
    this.logger.log(
      `[INVITE] to=${phone} from=${inviterName} code=${referralCode}`,
    );
    return Promise.resolve();
  }

  sendTemplate(
    phone: string,
    template: string,
    tokens: string[],
  ): Promise<void> {
    this.logger.log(
      `[TEMPLATE] to=${phone} template=${template} tokens=${tokens.join(',')}`,
    );
    return Promise.resolve();
  }
}

/**
 * Kavenegar VerifyLookup / simple send.
 * Docs: https://kavenegar.com/rest.html
 *
 * Env:
 *   KAVENEGAR_API_KEY
 *   KAVENEGAR_OTP_TEMPLATE   (default: verify)
 *   KAVENEGAR_INVITE_TEMPLATE (optional)
 *   KAVENEGAR_SENDER         (optional line number for plain SMS)
 */
@Injectable()
export class KavenegarSmsService extends SmsService {
  private readonly logger = new Logger('KavenegarSms');
  private readonly apiKey: string;
  private readonly otpTemplate: string;
  private readonly inviteTemplate?: string;
  private readonly sender?: string;
  private readonly debugMode: boolean;

  constructor(config: ConfigService) {
    super();
    this.apiKey = config.getOrThrow<string>('KAVENEGAR_API_KEY').trim();
    this.otpTemplate = config.get<string>('KAVENEGAR_OTP_TEMPLATE', 'verify');
    this.inviteTemplate = config.get<string>('KAVENEGAR_INVITE_TEMPLATE');
    this.sender = config.get<string>('KAVENEGAR_SENDER') || undefined;
    const debug = config.get<string | boolean>('DEBUG_MODE', 'false');
    this.debugMode =
      typeof debug === 'boolean'
        ? debug
        : String(debug ?? 'false')
            .trim()
            .toLowerCase() === 'true';
  }

  /** API key may contain `+` / `=` — must be path-encoded or Kavenegar returns 404. */
  private apiUrl(path: string): string {
    return `https://api.kavenegar.com/v1/${encodeURIComponent(this.apiKey)}/${path}`;
  }

  private toLocalPhone(phone: string): string {
    // +98912… → 0912…
    if (phone.startsWith('+98')) return `0${phone.slice(3)}`;
    return phone;
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    // Only log the code when debugging; real send always goes through Kavenegar.
    if (this.debugMode) {
      this.logger.log(`[DEBUG OTP] to=${phone} code=${code}`);
    }
    await this.verifyLookup(phone, this.otpTemplate, [code]);
  }

  async sendInvite(
    phone: string,
    inviterName: string,
    referralCode: string,
  ): Promise<void> {
    if (this.inviteTemplate) {
      await this.verifyLookup(phone, this.inviteTemplate, [
        inviterName,
        referralCode,
      ]);
      return;
    }
    await this.sendPlain(
      phone,
      `${inviterName} شما را به Gym4Me دعوت کرد. کد معرف: ${referralCode}`,
    );
  }

  async sendTemplate(
    phone: string,
    template: string,
    tokens: string[],
  ): Promise<void> {
    await this.verifyLookup(phone, template, tokens);
  }

  private async verifyLookup(
    phone: string,
    template: string,
    tokens: string[],
  ): Promise<void> {
    const receptor = this.toLocalPhone(phone);
    const params = new URLSearchParams({
      receptor,
      template,
      token: tokens[0] ?? '',
    });
    if (tokens[1]) params.set('token2', tokens[1]);
    if (tokens[2]) params.set('token3', tokens[2]);

    await this.request(
      `${this.apiUrl('verify/lookup.json')}?${params}`,
      { method: 'GET' },
      'verify',
      template,
    );
  }

  private async sendPlain(phone: string, message: string): Promise<void> {
    const receptor = this.toLocalPhone(phone);
    const params = new URLSearchParams({
      receptor,
      message,
    });
    if (this.sender) params.set('sender', this.sender);

    await this.request(
      this.apiUrl('sms/send.json'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      },
      'send',
    );
  }

  private async request(
    url: string,
    init: RequestInit,
    operation: 'verify' | 'send',
    template?: string,
  ): Promise<void> {
    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (error) {
      this.logger.error(`Kavenegar ${operation} request failed`, error);
      throw new BadGatewayException('SMS provider is unreachable');
    }

    const body = await res.text();
    let json: KavenegarResponse;
    try {
      json = JSON.parse(body) as KavenegarResponse;
    } catch {
      this.logger.error(
        `Kavenegar ${operation} failed: http=${res.status} invalid response`,
      );
      throw new BadGatewayException(
        'SMS provider returned an invalid response',
      );
    }

    const status = json.return?.status;
    if (res.ok && (status === undefined || status === 200)) return;

    const message = json.return?.message ?? 'Unknown Kavenegar error';
    this.logger.error(
      `Kavenegar ${operation} failed: http=${res.status} status=${status}: ${message}`,
    );

    if (status === 501) {
      throw new ServiceUnavailableException(
        'Kavenegar account is in test mode and can only send SMS to the account owner phone. Activate the Kavenegar account for public OTP delivery.',
      );
    }
    if (status === 424 && template) {
      throw new ServiceUnavailableException(
        `Kavenegar OTP template "${template}" was not found or is not approved`,
      );
    }
    throw new BadGatewayException(
      `Kavenegar SMS failed (${status ?? res.status})`,
    );
  }
}
