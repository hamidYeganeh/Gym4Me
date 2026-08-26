import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KavenegarSmsService } from './sms.service';

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as Response;
}

describe('KavenegarSmsService', () => {
  const originalFetch = global.fetch;
  let service: KavenegarSmsService;

  beforeEach(() => {
    const config = new ConfigService({
      KAVENEGAR_API_KEY: 'test-api-key',
      KAVENEGAR_OTP_TEMPLATE: 'verify',
      DEBUG_MODE: 'false',
    });
    service = new KavenegarSmsService(config);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('normalizes an E.164 Iranian phone before sending OTP', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response(200, { return: { status: 200, message: 'تایید شد' } }),
      );

    await service.sendOtp('+989121234567', '123456');

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain('receptor=09121234567');
    expect(url).toContain('template=verify');
    expect(url).toContain('token=123456');
  });

  it('surfaces Kavenegar test-account status 501 as service unavailable', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response(501, {
        return: {
          status: 501,
          message:
            'فقط امکان ارسال پیام تست به شماره صاحب حساب کاربری وجود دارد',
        },
      }),
    );

    await expect(service.sendOtp('+989121234567', '123456')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('maps unreachable provider errors to bad gateway', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    await expect(service.sendOtp('+989121234567', '123456')).rejects.toThrow(
      BadGatewayException,
    );
  });

  it('sends rendered booking text as plain SMS when no lookup template is configured', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response(200, { return: { status: 200, message: 'تایید شد' } }),
      );

    await service.sendTemplate(
      '+989121234567',
      undefined,
      ['باشگاه', '1405/06/04', '18:00'],
      'رزرو شما تأیید شد.',
    );

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toContain('/sms/send.json');
    expect(init.method).toBe('POST');
    expect(new URLSearchParams(String(init.body)).get('message')).toBe(
      'رزرو شما تأیید شد.',
    );
  });

  it('uses Kavenegar lookup when an approved booking template is configured', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response(200, { return: { status: 200, message: 'تایید شد' } }),
      );

    await service.sendTemplate(
      '+989121234567',
      'booking-confirmed',
      ['باشگاه', '1405/06/04', '18:00'],
      'fallback',
    );

    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toContain('/verify/lookup.json');
    expect(url).toContain('template=booking-confirmed');
    expect(url).toContain('token3=18%3A00');
  });
});
