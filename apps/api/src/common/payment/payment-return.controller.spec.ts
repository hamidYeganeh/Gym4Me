import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  assertPaymentReturnPath,
  PaymentReturnController,
} from './payment-return.controller';

describe('PaymentReturnController', () => {
  it('redirects only allowlisted PSP fields into the registered app scheme', () => {
    const controller = new PaymentReturnController(
      new ConfigService({ MOBILE_DEEP_LINK_SCHEME: 'com.gym4me.app' }),
    );
    const redirect = jest.fn<void, [number, string]>();
    const response = {
      setHeader: jest.fn(),
      redirect,
    };
    controller.native(
      '/owner/subscription',
      undefined,
      '64b64b64b64b64b64b64b64b',
      'authority-1',
      'OK',
      response as never,
    );

    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-store',
    );
    const target = new URL(redirect.mock.calls[0][1]);
    expect(redirect).toHaveBeenCalledWith(302, expect.any(String));
    expect(target.protocol).toBe('com.gym4me.app:');
    expect(target.hostname).toBe('payment-return');
    expect(target.searchParams.get('returnPath')).toBe('/owner/subscription');
    expect(target.searchParams.get('platformCheckoutId')).toBe(
      '64b64b64b64b64b64b64b64b',
    );
    expect(target.searchParams.get('Authority')).toBe('authority-1');
    expect(target.searchParams.get('Status')).toBe('OK');
  });

  it.each([
    '/admin/users',
    '//evil.test',
    '/athlete/bookings/not-an-object-id',
  ])('rejects unsafe return path %s', (path) => {
    expect(() => assertPaymentReturnPath(path)).toThrow(BadRequestException);
  });
});
