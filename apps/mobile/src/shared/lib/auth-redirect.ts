/** Build the sign-in URL, optionally returning the user to `returnPath` after auth. */
export function authHref(returnPath?: string | null): string {
  if (!returnPath || !returnPath.startsWith("/")) return "/auth";
  return `/auth?next=${encodeURIComponent(returnPath)}`;
}
