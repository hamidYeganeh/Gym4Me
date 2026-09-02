import type { AccessAssignment } from "@repo/api/v2";

export const BUSINESS_ROLE_CODES = ["club_owner", "branch_manager", "reception", "finance_staff"] as const;
const rolePriority = new Map<string, number>(BUSINESS_ROLE_CODES.map((role, index) => [role, index]));

export function selectBusinessAssignment(assignments: AccessAssignment[]): AccessAssignment | null {
  return assignments
    .filter((item) => rolePriority.has(item.role_code ?? ""))
    .sort((left, right) => (rolePriority.get(left.role_code ?? "") ?? 99) - (rolePriority.get(right.role_code ?? "") ?? 99))[0] ?? null;
}
