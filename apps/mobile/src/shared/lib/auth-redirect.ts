import type { Role } from "@repo/api";
import { FLAG_KEYS, readFlag } from "@/shared/lib/flag-storage";
import { roleHomePath } from "@/shared/lib/role-routes";

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

type PostAuthSession = {
  activeRole: Role | null | undefined;
  isNewUser?: boolean;
};

function needsProfileOnboarding(isNewUser?: boolean): boolean {
  return (
    Boolean(isNewUser) && readFlag(FLAG_KEYS.onboardingProfileDone) !== "1"
  );
}

/**
 * Destination after a successful auth mutation.
 * New users who have not finished onboarding go to `/onboarding`;
 * everyone else lands on `next` (if in-app) or `/{role}`.
 */
export function postAuthPath(
  session: PostAuthSession,
  next?: string | null,
): string {
  const returnPath =
    next && next.startsWith("/") ? next : roleHomePath(session.activeRole);

  if (needsProfileOnboarding(session.isNewUser)) {
    return `/onboarding?next=${encodeURIComponent(returnPath)}`;
  }

  return returnPath;
}
