const INTERNAL_PUSH_PATHS = [
  /^\/athlete\/notifications$/,
  /^\/athlete\/bookings$/,
  /^\/athlete\/bookings\/[a-f\d]{24}$/i,
  /^\/athlete\/waitlist$/,
  /^\/athlete\/wallet$/,
  /^\/athlete\/memberships$/,
  /^\/coach\/notifications$/,
  /^\/coach\/bookings$/,
];

/** Accept only known internal routes from an untrusted push payload. */
export function parsePushAction(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 300) return null;
  let url: URL;
  try {
    url = new URL(value, "https://mobile.gym4me.invalid");
  } catch {
    return null;
  }
  if (url.origin !== "https://mobile.gym4me.invalid") return null;
  if (!INTERNAL_PUSH_PATHS.some((pattern) => pattern.test(url.pathname))) return null;
  return `${url.pathname}${url.search}`;
}
