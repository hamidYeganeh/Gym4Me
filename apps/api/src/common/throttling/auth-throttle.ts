import type { ExecutionContext } from '@nestjs/common';

/** Named Nest throttlers for OTP request + password login. */
export const AUTH_THROTTLE_MINUTE = 'authMinute';
export const AUTH_THROTTLE_DAY = 'authDay';

export const AUTH_THROTTLE = {
  [AUTH_THROTTLE_MINUTE]: { limit: 3, ttl: 60_000 },
  [AUTH_THROTTLE_DAY]: { limit: 7, ttl: 86_400_000 },
} as const;

/**
 * Skip named auth throttlers unless the route opted in via `@Throttle(AUTH_THROTTLE)`.
 * Keeps global authMinute/authDay from applying to every endpoint.
 */
export function skipUnlessAuthThrottleNamed(name: string) {
  const metaKey = `THROTTLER:LIMIT${name}`;
  return (context: ExecutionContext) => {
    const handler = context.getHandler();
    const classRef = context.getClass();
    return (
      Reflect.getMetadata(metaKey, handler) === undefined &&
      Reflect.getMetadata(metaKey, classRef) === undefined
    );
  };
}
