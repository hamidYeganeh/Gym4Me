import type { PublicUser, Role } from "@repo/api";
import { hasCompletedOnboarding } from "@/modules/app/lib/onboarding-storage";
import { roleHomePath } from "@/shared/lib/role-routes";

/** Build the auth entry URL, optionally returning the user to `returnPath` after auth. */
export function authHref(returnPath?: string | null): string {
  return withAuthNext("/auth", returnPath);
}

export const AUTH_SET_PASSWORD_PATH = "/auth/set-password";

type AuthNextPath =
  | "/auth"
  | "/auth/login"
  | "/auth/otp"
  | "/auth/forgot-password"
  | typeof AUTH_SET_PASSWORD_PATH;

/** Append `?next=` when `returnPath` is an in-app path. */
export function withAuthNext(
  path: AuthNextPath,
  returnPath?: string | null,
): string {
  if (!returnPath || !returnPath.startsWith("/")) return path;
  return `${path}?next=${encodeURIComponent(returnPath)}`;
}

/** Post-login password setup for OTP-only accounts. */
export function setPasswordHref(returnPath?: string | null): string {
  return withAuthNext(AUTH_SET_PASSWORD_PATH, returnPath);
}

export type PostAuthSession = {
  activeRole: Role | null | undefined;
  isNewUser?: boolean;
  user?: Pick<PublicUser, "id" | "name" | "credentials"> | null;
};

/** OTP-only accounts that have not chosen a password yet. */
export function needsPasswordSetup(session: PostAuthSession): boolean {
  return session.user?.credentials?.password === "unset";
}

/**
 * New OTP registrations, or accounts that never finished the wizard
 * (no first name yet) and have not skipped/completed on this device.
 */
export function needsProfileOnboarding(session: PostAuthSession): boolean {
  const userId = session.user?.id;
  if (!userId) return Boolean(session.isNewUser);

  if (hasCompletedOnboarding(userId)) return false;

  if (session.isNewUser) return true;

  const firstName = session.user?.name?.first?.trim();
  return !firstName;
}

/**
 * Destination after a successful auth mutation.
 * Incomplete / new profiles go to `/onboarding`;
 * everyone else lands on `next` (if in-app) or `/{role}`.
 */
export function postAuthPath(
  session: PostAuthSession,
  next?: string | null,
): string {
  const returnPath =
    next && next.startsWith("/") ? next : roleHomePath(session.activeRole);

  if (needsPasswordSetup(session)) {
    return setPasswordHref(returnPath);
  }

  if (needsProfileOnboarding(session)) {
    return `/onboarding?next=${encodeURIComponent(returnPath)}`;
  }

  return returnPath;
}
