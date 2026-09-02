export const ORGANIZATION_TYPES = [
  "club_business",
  "corporate",
  "coach_business",
  "other",
] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const ORGANIZATION_STATUSES = [
  "draft",
  "pending_verification",
  "active",
  "suspended",
  "rejected",
  "archived",
] as const;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

export const WORKING_HOURS_STATUSES = ["active", "closed"] as const;
export type WorkingHoursStatus = (typeof WORKING_HOURS_STATUSES)[number];

export const HOLIDAY_STATUSES = ["closed", "special_hours"] as const;
export type HolidayStatus = (typeof HOLIDAY_STATUSES)[number];

export const STAFF_SCOPE_TYPES = ["organization", "branch"] as const;
export type StaffScopeType = (typeof STAFF_SCOPE_TYPES)[number];

export const STAFF_INVITATION_STATUSES = ["pending", "accepted", "revoked", "expired"] as const;
export type StaffInvitationStatus = (typeof STAFF_INVITATION_STATUSES)[number];

export const MEMBER_STATUSES = ["active", "suspended", "ended"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];
