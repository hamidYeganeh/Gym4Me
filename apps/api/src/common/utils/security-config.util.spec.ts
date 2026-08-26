import { assertSecurityConfig } from './security-config.util';

const productionEnv = {
  NODE_ENV: 'production',
  JWT_ACCESS_SECRET: 'access-secret-that-is-longer-than-thirty-two-chars',
  JWT_PASSWORD_RESET_SECRET:
    'reset-secret-that-is-different-and-longer-than-thirty-two',
  DEBUG_MODE: 'false',
  SMS_PROVIDER: 'kavenegar',
  KAVENEGAR_API_KEY: 'valid-kavenegar-key',
  PUSH_PROVIDER: 'fcm',
  FCM_SERVICE_ACCOUNT: '{"project_id":"gym4me"}',
} satisfies NodeJS.ProcessEnv;

describe('assertSecurityConfig payment provider', () => {
  it('rejects mock payments in production without an explicit override', () => {
    expect(() =>
      assertSecurityConfig({ ...productionEnv, PAYMENT_PROVIDER: 'mock' }),
    ).toThrow('explicit mock-payment override');
  });

  it('allows the explicitly approved production mock provider', () => {
    expect(() =>
      assertSecurityConfig({
        ...productionEnv,
        PAYMENT_PROVIDER: 'mock',
        ALLOW_MOCK_PAYMENT_IN_PRODUCTION: 'true',
      }),
    ).not.toThrow();
  });

  it('still requires a merchant id for Zarinpal', () => {
    expect(() =>
      assertSecurityConfig({
        ...productionEnv,
        PAYMENT_PROVIDER: 'zarinpal',
      }),
    ).toThrow('valid ZARINPAL_MERCHANT_ID');
  });
});
