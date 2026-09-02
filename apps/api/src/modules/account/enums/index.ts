export const USER_STATUSES = ["active", "blocked", "suspended", "archived"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const OTP_PURPOSES = [
  "LOGIN",
  "REGISTER",
  "PASSWORD_RESET",
  "PHONE_CHANGE",
  "SENSITIVE_ACTION",
] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export const OTP_STATUSES = ["pending", "consumed", "expired"] as const;
export type OtpStatus = (typeof OTP_STATUSES)[number];

export const SESSION_STATUSES = ["active", "revoked"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const ROLE_TYPES = ["custom", "admin", "organization_default", "system"] as const;
export type RoleType = (typeof ROLE_TYPES)[number];
export const ASSIGNABLE_ROLE_TYPES = ["custom", "admin", "organization_default"] as const;

export const USER_CREATE_STATUSES = ["active", "blocked", "suspended"] as const;

export const ROLE_STATUSES = ["active", "inactive", "archived"] as const;
export type RoleStatus = (typeof ROLE_STATUSES)[number];

export const PERMISSION_EFFECTS = ["allow", "deny"] as const;
export type PermissionEffect = (typeof PERMISSION_EFFECTS)[number];

export const COACH_VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "rejected",
  "needs_correction",
] as const;
export type CoachVerificationStatus = (typeof COACH_VERIFICATION_STATUSES)[number];
