const WEAK_SECRETS = new Set([
  '',
  'dev-access-secret-change-me',
  'dev-refresh-secret-change-me',
  'change-me',
  'secret',
  'password',
]);

function isWeakSecret(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (trimmed.length < 32) return true;
  return WEAK_SECRETS.has(trimmed);
}

function isMissingCredential(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  return /^(replace-me|change-me|todo|example)/i.test(value.trim());
}

/**
 * Fail fast on boot when JWT secrets are missing/weak or DEBUG_MODE is on in production.
 */
export function assertSecurityConfig(
  env: NodeJS.ProcessEnv = process.env,
): void {
  const access = env.JWT_ACCESS_SECRET;
  const reset = env.JWT_PASSWORD_RESET_SECRET;
  const nodeEnv = (env.NODE_ENV ?? 'development').toLowerCase();
  const isProd = nodeEnv === 'production';

  if (isWeakSecret(access)) {
    throw new Error(
      'JWT_ACCESS_SECRET must be set to a strong value (≥32 chars, not a known default)',
    );
  }
  if (isWeakSecret(reset)) {
    throw new Error(
      'JWT_PASSWORD_RESET_SECRET must be set to a strong value (≥32 chars, not a known default)',
    );
  }
  if (access === reset) {
    throw new Error(
      'JWT_PASSWORD_RESET_SECRET must differ from JWT_ACCESS_SECRET',
    );
  }

  const debug = String(env.DEBUG_MODE ?? 'false')
    .trim()
    .toLowerCase();
  if (isProd && debug === 'true') {
    throw new Error('DEBUG_MODE must not be enabled in production');
  }

  if (isProd) {
    if ((env.SMS_PROVIDER ?? '').toLowerCase() !== 'kavenegar') {
      throw new Error('Production requires SMS_PROVIDER=kavenegar');
    }
    if (isMissingCredential(env.KAVENEGAR_API_KEY)) {
      throw new Error('Production requires a valid KAVENEGAR_API_KEY');
    }
    if ((env.PAYMENT_PROVIDER ?? '').toLowerCase() !== 'zarinpal') {
      throw new Error('Production requires PAYMENT_PROVIDER=zarinpal');
    }
    if (isMissingCredential(env.ZARINPAL_MERCHANT_ID)) {
      throw new Error('Production requires a valid ZARINPAL_MERCHANT_ID');
    }
    if ((env.PUSH_PROVIDER ?? '').toLowerCase() !== 'fcm') {
      throw new Error('Production requires PUSH_PROVIDER=fcm');
    }
    if (isMissingCredential(env.FCM_SERVICE_ACCOUNT)) {
      throw new Error('Production requires FCM_SERVICE_ACCOUNT');
    }
  }
}

export function resolveCorsOrigin(
  env: NodeJS.ProcessEnv = process.env,
): boolean | string[] {
  const raw = env.CORS_ORIGINS?.trim();
  if (raw) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  // Reflect any origin only outside production (local apps / Capacitor).
  if ((env.NODE_ENV ?? 'development').toLowerCase() !== 'production') {
    return true;
  }
  return false;
}
