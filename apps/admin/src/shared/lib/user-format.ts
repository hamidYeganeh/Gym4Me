import type { KycStatus, PublicUser, Role, UserStatus } from "@repo/api";

export function userDisplayName(
  user: Pick<PublicUser, "name">,
  fallback = "",
): string {
  const name = [user.name.first, user.name.last].filter(Boolean).join(" ");
  return name || fallback;
}

export const USER_ROLES: Role[] = [
  "athlete",
  "coach",
  "club_owner",
  "club_staff",
  "admin",
];

export const USER_STATUSES: UserStatus[] = ["active", "blocked", "deleted"];

export const KYC_STATUSES: KycStatus[] = [
  "none",
  "pending",
  "approved",
  "rejected",
];

export function statusChipColor(
  status: UserStatus,
): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "active":
      return "success";
    case "blocked":
      return "warning";
    case "deleted":
      return "danger";
    default:
      return "default";
  }
}

export function kycChipColor(
  status: KycStatus,
): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    default:
      return "default";
  }
}

export function formatAdminDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fa-IR");
}
