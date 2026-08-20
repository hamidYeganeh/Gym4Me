/**
 * Classify App Router navigations for Telegram-style stack transitions.
 * Tab roots / primary homes do not slide horizontally.
 */

import { isSecondaryPagePath } from "./secondary-page-path";

export type NavigationDirection = -1 | 0 | 1;

function pathDepth(pathname: string): number {
  return pathname.split("/").filter(Boolean).length;
}

/** Routes that should not participate in stack slide transitions. */
const SKIP_PREFIXES = [
  "/splash",
  "/auth",
  "/welcome",
  "/onboarding",
  "/dev",
  "/force-update",
];

export function shouldAnimatePageTransition(pathname: string): boolean {
  return !SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * `1` = push (forward), `-1` = pop (back), `0` = tab/replace (no horizontal slide).
 */
export function classifyNavigation(
  from: string,
  to: string,
): NavigationDirection {
  if (from === to) return 0;

  const fromAnim = shouldAnimatePageTransition(from);
  const toAnim = shouldAnimatePageTransition(to);
  if (!fromAnim || !toAnim) return 0;

  const fromSec = isSecondaryPagePath(from);
  const toSec = isSecondaryPagePath(to);

  if (!fromSec && !toSec) return 0;
  if (!fromSec && toSec) return 1;
  if (fromSec && !toSec) return -1;

  const delta = pathDepth(to) - pathDepth(from);
  if (delta > 0) return 1;
  if (delta < 0) return -1;
  return 1;
}
