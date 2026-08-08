import type { Role } from "@repo/api";

/** Map JWT `activeRole` to mobile app home path. */
export function roleHomePath(role: Role | null | undefined): string {
  switch (role) {
    case "coach":
      return "/coach";
    case "club_owner":
      return "/owner";
    case "athlete":
    default:
      return "/athlete";
  }
}

export function isSelfApplicableRole(role: Role): boolean {
  return role === "coach" || role === "club_owner";
}
