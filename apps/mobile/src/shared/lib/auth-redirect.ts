/** Build the auth entry URL, optionally returning the user to `returnPath` after auth. */
export function authHref(returnPath?: string | null): string {
  return withAuthNext("/auth", returnPath);
}

/** Append `?next=` when `returnPath` is an in-app path. */
export function withAuthNext(
  path: "/auth" | "/auth/login" | "/auth/otp" | "/auth/forgot-password",
  returnPath?: string | null,
): string {
  if (!returnPath || !returnPath.startsWith("/")) return path;
  return `${path}?next=${encodeURIComponent(returnPath)}`;
}
