import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';
import { OtpPurpose } from '../../common/enums';
import { REDIS } from '../../common/redis/redis.module';
import { SmsService } from '../../common/sms/sms.service';
import { randomOtpCode, sha256 } from '../../common/utils/hash.util';

const OTP_TTL_SECONDS = 120;
/** Align with authMinute throttler (3/min) — allow a send about every 20s. */
const RESEND_COOLDOWN_SECONDS = 20;
const MAX_ATTEMPTS = 5;
const OTP_DIGITS = 6;
/** Max OTP SMS sends per phone per rolling 24h (all purposes). */
const DAILY_OTP_LIMIT = 7;
const DAILY_OTP_WINDOW_SECONDS = 86_400;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly sms: SmsService,
    private readonly config: ConfigService,
  ) {}

  private isDebugMode(): boolean {
    const value = this.config.get<string | boolean>('DEBUG_MODE', 'false');
    if (typeof value === 'boolean') return value;
    return (
      String(value ?? 'false')
        .trim()
        .toLowerCase() === 'true'
    );
  }

  private codeKey(purpose: OtpPurpose, phone: string) {
    return `otp:${purpose}:${phone}`;
  }

  private attemptsKey(purpose: OtpPurpose, phone: string) {
    return `otp:attempts:${purpose}:${phone}`;
  }

  private cooldownKey(purpose: OtpPurpose, phone: string) {
    return `otp:cooldown:${purpose}:${phone}`;
  }

  private dailyKey(phone: string) {
    return `otp:daily:${phone}`;
  }

  async request(
    phone: string,
    purpose: OtpPurpose,
  ): Promise<{ expiresInSeconds: number; debugCode?: string }> {
    const cooldownTtl = await this.redis.ttl(this.cooldownKey(purpose, phone));
    if (cooldownTtl > 0) {
      throw new HttpException(
        `OTP recently sent, retry in ${cooldownTtl}s`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const dailyCount = await this.redis.incr(this.dailyKey(phone));
    if (dailyCount === 1) {
      await this.redis.expire(this.dailyKey(phone), DAILY_OTP_WINDOW_SECONDS);
    }
    if (dailyCount > DAILY_OTP_LIMIT) {
      throw new HttpException(
        'OTP daily limit reached, try again tomorrow',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = randomOtpCode(OTP_DIGITS);
    const codeHash = sha256(code);
    await this.redis
      .multi()
      .set(this.codeKey(purpose, phone), codeHash, 'EX', OTP_TTL_SECONDS)
      .del(this.attemptsKey(purpose, phone))
      .set(
        this.cooldownKey(purpose, phone),
        codeHash,
        'EX',
        RESEND_COOLDOWN_SECONDS,
      )
      .exec();

    const debug = this.isDebugMode();
    if (debug) {
      this.logger.log(`[DEBUG] purpose=${purpose} phone=${phone} code=${code}`);
    } else {
      try {
        await this.sms.sendOtp(phone, code);
      } catch (error) {
        try {
          await this.rollbackFailedSend(phone, purpose, codeHash);
        } catch (rollbackError) {
          this.logger.error(
            'Failed to roll back rejected OTP send',
            rollbackError,
          );
        }
        throw error;
      }
    }

    return {
      expiresInSeconds: OTP_TTL_SECONDS,
      ...(debug ? { debugCode: code } : {}),
    };
  }

  private async rollbackFailedSend(
    phone: string,
    purpose: OtpPurpose,
    codeHash: string,
  ): Promise<void> {
    // Compare before deleting so a slow failed request cannot remove a newer OTP.
    await this.redis.eval(
      `
        if redis.call('GET', KEYS[1]) == ARGV[1] then
          redis.call('DEL', KEYS[1], KEYS[2])
        end
        if redis.call('GET', KEYS[3]) == ARGV[1] then
          redis.call('DEL', KEYS[3])
        end
        local daily = tonumber(redis.call('GET', KEYS[4]) or '0')
        if daily > 0 then
          redis.call('DECR', KEYS[4])
        end
        return 1
      `,
      4,
      this.codeKey(purpose, phone),
      this.attemptsKey(purpose, phone),
      this.cooldownKey(purpose, phone),
      this.dailyKey(phone),
      codeHash,
    );
  }

  async verify(
    phone: string,
    purpose: OtpPurpose,
    code: string,
  ): Promise<void> {
    const codeKey = this.codeKey(purpose, phone);
    const attemptsKey = this.attemptsKey(purpose, phone);

    const stored = await this.redis.get(codeKey);
    if (!stored) {
      throw new UnauthorizedException('Code expired or not requested');
    }

    const attempts = await this.redis.incr(attemptsKey);
    if (attempts === 1) await this.redis.expire(attemptsKey, OTP_TTL_SECONDS);
    if (attempts > MAX_ATTEMPTS) {
      await this.redis.del(codeKey, attemptsKey);
      throw new UnauthorizedException('Too many attempts, request a new code');
    }

    if (stored !== sha256(code)) {
      throw new UnauthorizedException('Invalid code');
    }

    // Single use
    await this.redis.del(codeKey, attemptsKey);
  }
}
