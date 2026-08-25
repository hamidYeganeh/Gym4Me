import { BadRequestException } from '@nestjs/common';

/** Prevent payment authorities from being redirected to attacker-controlled origins. */
export function assertAllowedPaymentCallbackUrl(
  value: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  let callback: URL;
  try {
    callback = new URL(value);
  } catch {
    throw new BadRequestException('Invalid payment callback URL');
  }
  if (!['http:', 'https:'].includes(callback.protocol)) {
    throw new BadRequestException('Unsupported payment callback protocol');
  }
  if (callback.username || callback.password) {
    throw new BadRequestException(
      'Payment callback URL cannot contain credentials',
    );
  }

  const isProduction =
    (env.NODE_ENV ?? 'development').toLowerCase() === 'production';
  if (!isProduction) return callback.toString();
  if (callback.protocol !== 'https:') {
    throw new BadRequestException('Production payment callback must use HTTPS');
  }
  const allowedOrigins = (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const apiOrigin = (() => {
    try {
      return env.API_BASE_URL ? new URL(env.API_BASE_URL).origin : undefined;
    } catch {
      return undefined;
    }
  })();
  if (apiOrigin) allowedOrigins.push(apiOrigin);
  if (!allowedOrigins.includes(callback.origin)) {
    throw new BadRequestException('Payment callback origin is not allowed');
  }
  return callback.toString();
}
