import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';
import { OtpPurpose } from '../../common/enums';
import { SmsService } from '../../common/sms/sms.service';
import { OtpService } from './otp.service';

describe('OtpService', () => {
  function createRedisMock() {
    const multi = {
      set: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    return {
      ttl: jest.fn().mockResolvedValue(-2),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      multi: jest.fn(() => multi),
      eval: jest.fn().mockResolvedValue(1),
      multiCommands: multi,
    };
  }

  it('removes the OTP reservation and restores quota when SMS delivery fails', async () => {
    const redis = createRedisMock();
    const sms = {
      sendOtp: jest.fn().mockRejectedValue(new Error('provider rejected')),
    } as unknown as SmsService;
    const service = new OtpService(
      redis as unknown as Redis,
      sms,
      new ConfigService({ DEBUG_MODE: 'false' }),
    );

    await expect(
      service.request('+989121234567', OtpPurpose.AUTH),
    ).rejects.toThrow('provider rejected');

    expect(redis.eval).toHaveBeenCalledTimes(1);
    expect(redis.eval).toHaveBeenCalledWith(
      expect.any(String),
      4,
      'otp:auth:+989121234567',
      'otp:attempts:auth:+989121234567',
      'otp:cooldown:auth:+989121234567',
      'otp:daily:+989121234567',
      expect.any(String),
    );
  });

  it('keeps the OTP reservation after a successful SMS send', async () => {
    const redis = createRedisMock();
    const sms = {
      sendOtp: jest.fn().mockResolvedValue(undefined),
    } as unknown as SmsService;
    const service = new OtpService(
      redis as unknown as Redis,
      sms,
      new ConfigService({ DEBUG_MODE: 'false' }),
    );

    await expect(
      service.request('+989121234567', OtpPurpose.AUTH),
    ).resolves.toEqual({ expiresInSeconds: 120 });
    expect(sms.sendOtp).toHaveBeenCalledTimes(1);
    expect(redis.eval).not.toHaveBeenCalled();
  });

  it('skips SMS and returns debugCode when DEBUG_MODE is on', async () => {
    const redis = createRedisMock();
    const sms = {
      sendOtp: jest.fn().mockResolvedValue(undefined),
    } as unknown as SmsService;
    const service = new OtpService(
      redis as unknown as Redis,
      sms,
      new ConfigService({ DEBUG_MODE: 'true' }),
    );

    const result = await service.request('+989121234567', OtpPurpose.AUTH);

    expect(sms.sendOtp).not.toHaveBeenCalled();
    expect(result.expiresInSeconds).toBe(120);
    expect(result.debugCode).toMatch(/^\d{5}$/);
  });

  it('preserves the provider error if rollback also fails', async () => {
    const redis = createRedisMock();
    redis.eval.mockRejectedValue(new Error('redis unavailable'));
    const sms = {
      sendOtp: jest.fn().mockRejectedValue(new Error('provider rejected')),
    } as unknown as SmsService;
    const service = new OtpService(
      redis as unknown as Redis,
      sms,
      new ConfigService({ DEBUG_MODE: 'false' }),
    );

    await expect(
      service.request('+989121234567', OtpPurpose.AUTH),
    ).rejects.toThrow('provider rejected');
  });
});
