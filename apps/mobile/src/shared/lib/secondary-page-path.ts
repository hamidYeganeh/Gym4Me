/** Bottom-nav tab roots — not role homes; keep their own header chrome. */
const TAB_ROOTS = new Set([
  "/athlete/bookings",
  "/coach/calendar/daily",
  "/coach/clients",
  "/owner/members",
  "/owner/finance",
  "/athlete/profile",
  "/coach/profile",
  "/owner/profile",
  "/discovery",
  "/community",
]);

const IMMERSIVE_SEGMENTS = [
  "/create",
  "/edit",
  "/payment",
  "/reserve",
  "/reschedule",
  "/qr-check-in",
];

const PRIMARY_ROLE_HOMES = new Set(["/athlete", "/coach", "/owner"]);

/** True for nested product routes that should use the secondary page header cap. */
export function isSecondaryPagePath(pathname: string): boolean {
  if (PRIMARY_ROLE_HOMES.has(pathname)) return false;
  if (TAB_ROOTS.has(pathname)) return false;
  if (IMMERSIVE_SEGMENTS.some((segment) => pathname.includes(segment))) {
    return false;
  }

  // Discovery detail hero routes use morph headers.
  if (/^\/discovery\/(clubs|coaches|classes)\/[^/]+(\/classes\/[^/]+)?$/.test(pathname)) {
    return false;
  }

  return (
    pathname.startsWith("/athlete/") ||
    pathname.startsWith("/coach/") ||
    pathname.startsWith("/owner/") ||
    pathname.startsWith("/discovery/") ||
    pathname.startsWith("/articles")
  );
}
