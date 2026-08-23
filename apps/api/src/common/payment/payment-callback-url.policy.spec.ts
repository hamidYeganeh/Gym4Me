import { BadRequestException } from '@nestjs/common';
import { assertAllowedPaymentCallbackUrl } from './payment-callback-url.policy';

describe('assertAllowedPaymentCallbackUrl', () => {
  it('allows local HTTP callbacks outside production', () => {
    expect(
      assertAllowedPaymentCallbackUrl('http://localhost:3000/return', {
        NODE_ENV: 'test',
      }),
    ).toBe('http://localhost:3000/return');
  });

  it('requires an allowlisted HTTPS origin in production', () => {
    const env = {
      NODE_ENV: 'production',
      CORS_ORIGINS: 'https://app.gym4me.ir,https://admin.gym4me.ir',
    };
    expect(
      assertAllowedPaymentCallbackUrl('https://app.gym4me.ir/return', env),
    ).toBe('https://app.gym4me.ir/return');
    expect(() =>
      assertAllowedPaymentCallbackUrl('https://evil.test/return', env),
    ).toThrow(BadRequestException);
    expect(() =>
      assertAllowedPaymentCallbackUrl('http://app.gym4me.ir/return', env),
    ).toThrow(BadRequestException);
  });

  it.each([
    'javascript:alert(1)',
    'file:///tmp/callback',
    'https://user:password@app.gym4me.ir/return',
  ])('rejects unsafe callback %s', (value) => {
    expect(() => assertAllowedPaymentCallbackUrl(value)).toThrow(
      BadRequestException,
    );
  });
});
