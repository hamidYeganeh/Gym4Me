import type { Role } from "@repo/api";

export type RoleSegment = "athlete" | "coach" | "owner";

/** URL segment for role-scoped routes under `(app)/`. */
export function roleSegment(role: Role | null | undefined): RoleSegment {
  switch (role) {
    case "coach":
      return "coach";
    case "club_owner":
      return "owner";
    case "athlete":
    default:
      return "athlete";
  }
}

/** Map JWT `activeRole` to the primary app home after splash / auth. */
export function roleHomePath(role: Role | null | undefined): string {
  switch (role) {
    case "coach":
      return "/coach";
    case "club_owner":
      return "/owner";
    case "athlete":
    default:
      return "/home";
  }
}

/** Role-scoped path under `/{segment}/...` (profile, KYC, notifications, …). */
export function roleAppPath(
  role: Role | null | undefined,
  suffix = "",
): string {
  const base = `/${roleSegment(role)}`;
  if (!suffix) return base;
  return `${base}/${suffix.replace(/^\//, "")}`;
}

export function isSelfApplicableRole(role: Role): boolean {
  return role === "coach" || role === "club_owner";
}
