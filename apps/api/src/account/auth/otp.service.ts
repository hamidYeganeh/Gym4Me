import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type Redis from 'ioredis';
import { OtpPurpose } from '../../common/enums';
import { REDIS } from '../../common/redis/redis.module';
import { SmsService } from '../../common/sms/sms.service';
import { randomOtpCode, sha256 } from '../../common/utils/hash.util';

const OTP_TTL_SECONDS = 120;
const RESEND_COOLDOWN_SECONDS = 90;
const MAX_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly sms: SmsService,
  ) {}

  private codeKey(purpose: OtpPurpose, phone: string) {
    return `otp:${purpose}:${phone}`;
  }

  private attemptsKey(purpose: OtpPurpose, phone: string) {
    return `otp:attempts:${purpose}:${phone}`;
  }

  private cooldownKey(phone: string) {
    return `otp:cooldown:${phone}`;
  }

  async request(
    phone: string,
    purpose: OtpPurpose,
  ): Promise<{ expiresInSeconds: number }> {
    const cooldownTtl = await this.redis.ttl(this.cooldownKey(phone));
    if (cooldownTtl > 0) {
      throw new HttpException(
        `OTP recently sent, retry in ${cooldownTtl}s`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = randomOtpCode(5);
    await this.redis
      .multi()
      .set(this.codeKey(purpose, phone), sha256(code), 'EX', OTP_TTL_SECONDS)
      .del(this.attemptsKey(purpose, phone))
      .set(this.cooldownKey(phone), '1', 'EX', RESEND_COOLDOWN_SECONDS)
      .exec();

    await this.sms.sendOtp(phone, code);

    return { expiresInSeconds: OTP_TTL_SECONDS };
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
