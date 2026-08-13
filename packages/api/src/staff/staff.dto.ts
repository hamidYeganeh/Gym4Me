import type { Paginated } from "../types";

export type StaffPermissionKey =
  | "bookings.create"
  | "bookings.read"
  | "bookings.checkin"
  | "finance.read"
  | "finance.settle"
  | "members.checkin"
  | "members.manage"
  | "staff.manage"
  | "sessions.manage"
  | "reports.read";

export type StaffRolePreset =
  | "reception"
  | "accountant"
  | "manager"
  | "custom";

export type ClubStaffStatus = "active" | "suspended" | "revoked";

export type ClubStaffMember = {
  id: string;
  clubId: string;
  userId: string;
  status: ClubStaffStatus;
  preset: StaffRolePreset;
  permissions: StaffPermissionKey[];
  invitedAt: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListStaffQuery = {
  page?: number;
  page_size?: number;
  status?: ClubStaffStatus;
};

export type UpsertStaffInput = {
  userId: string;
  preset: StaffRolePreset;
  permissions?: StaffPermissionKey[];
  status?: ClubStaffStatus;
};

export type UpdateStaffPermissionsInput = {
  preset?: StaffRolePreset;
  permissions?: StaffPermissionKey[];
  status?: ClubStaffStatus;
};

export type StaffPage = Paginated<ClubStaffMember>;
