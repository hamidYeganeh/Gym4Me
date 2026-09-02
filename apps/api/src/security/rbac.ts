import type { ScopeType } from "../common/contracts.js";

export const SYSTEM_ROLES = {
  ATHLETE: "athlete",
  COACH: "coach",
  CLUB_OWNER: "club_owner",
  BRANCH_MANAGER: "branch_manager",
  RECEPTION: "reception",
  FINANCE_STAFF: "finance_staff",
  CORPORATE_ADMIN: "corporate_admin",
  SUPER_ADMIN: "super_admin",
  USER_ADMIN: "user_admin",
  FINANCE_ADMIN: "finance_admin",
  VERIFICATION_ADMIN: "verification_admin",
  CONTENT_MODERATOR: "content_moderator",
  SUPPORT_AGENT: "support_agent",
} as const;

export const PERMISSIONS = {
  ALL: "*",
  ACCOUNT_PROFILE_READ_SELF: "account.profile.read.self",
  ACCOUNT_PROFILE_UPDATE_SELF: "account.profile.update.self",
  ACCOUNT_SECURITY_MANAGE_SELF: "account.security.manage.self",
  BOOKING_QUOTE_CREATE_SELF: "booking.quote.create.self",
  BOOKING_HOLD_CREATE_SELF: "booking.hold.create.self",
  BOOKING_MANAGE_SELF: "booking.manage.self",
  HOUSEHOLD_MANAGE_SELF: "booking.household.manage.self",
  WALLET_READ_SELF: "finance.wallet.read.self",
  WALLET_TOP_UP_SELF: "finance.wallet.top-up.self",
  PAYMENT_CREATE_SELF: "finance.payment.create.self",
  COACH_PROFILE_MANAGE_SELF: "coach.profile.manage.self",
  COACH_SCHEDULE_MANAGE_SELF: "coach.schedule.manage.self",
  COACH_BOOKING_READ_SELF: "coach.booking.read.self",
  BRANCH_BOOKING_READ: "branch.booking.read",
  BRANCH_BOOKING_CREATE: "branch.booking.create",
  BRANCH_BOOKING_CANCEL: "branch.booking.cancel",
  BRANCH_BOOKING_RESCHEDULE: "branch.booking.reschedule",
  BRANCH_BOOKING_OVERRIDE_CANCELLATION: "branch.booking.override-cancellation",
  BRANCH_CHECK_IN_CREATE: "branch.check-in.create",
  BRANCH_CHECK_OUT_CREATE: "branch.check-out.create",
  BRANCH_RESOURCES_READ: "branch.resources.read",
  BRANCH_RESOURCES_MANAGE: "branch.resources.manage",
  BRANCH_OFFERINGS_READ: "branch.offerings.read",
  BRANCH_OFFERINGS_MANAGE: "branch.offerings.manage",
  BRANCH_AVAILABILITY_READ: "branch.availability.read",
  BRANCH_AVAILABILITY_MANAGE: "branch.availability.manage",
  BRANCH_PROFILE_READ: "branch.profile.read",
  BRANCH_PROFILE_MANAGE: "branch.profile.manage",
  CLUB_PROFILE_READ: "club.profile.read",
  CLUB_PROFILE_MANAGE: "club.profile.manage",
  ORGANIZATION_PROFILE_READ: "organization.profile.read",
  ORGANIZATION_PROFILE_MANAGE: "organization.profile.manage",
  ORGANIZATION_STAFF_MANAGE: "organization.staff.manage",
  ORGANIZATION_ROLES_MANAGE: "organization.roles.manage",
  ORGANIZATION_FINANCE_READ: "organization.finance.read",
  ORGANIZATION_FINANCE_MANAGE: "organization.finance.manage",
  ORGANIZATION_MEMBERSHIPS_MANAGE: "organization.memberships.manage",
  ORGANIZATION_ADVERTISING_MANAGE: "organization.advertising.manage",
  ORGANIZATION_REVIEWS_MANAGE: "organization.reviews.manage",
  ORGANIZATION_ANNOUNCEMENTS_MANAGE: "organization.announcements.manage",
  ORGANIZATION_CANCELLATION_POLICY_MANAGE: "organization.cancellation-policy.manage",
  CORPORATE_MEMBERS_MANAGE: "corporate.members.manage",
  CORPORATE_BENEFITS_MANAGE: "corporate.benefits.manage",
  ADMIN_USERS_MANAGE: "admin.users.manage",
  ADMIN_BOOKINGS_MANAGE: "admin.bookings.manage",
  ADMIN_ORGANIZATIONS_MANAGE: "admin.organizations.manage",
  ADMIN_CATALOG_MANAGE: "admin.catalog.manage",
  ADMIN_VERIFICATIONS_MANAGE: "admin.verifications.manage",
  ADMIN_FINANCE_READ: "admin.finance.read",
  ADMIN_FINANCE_REFUND: "admin.finance.refund",
  ADMIN_FINANCE_ADJUST: "admin.finance.adjust",
  ADMIN_ADVERTISING_MANAGE: "admin.advertising.manage",
  ADMIN_REVIEWS_MODERATE: "admin.reviews.moderate",
  ADMIN_NOTIFICATIONS_MANAGE: "admin.notifications.manage",
  ADMIN_MEMBERSHIPS_MANAGE: "admin.memberships.manage",
  ADMIN_CONFIGURATION_MANAGE: "admin.configuration.manage",
  ADMIN_ROLES_MANAGE: "admin.roles.manage",
  ADMIN_AUDIT_READ: "admin.audit.read",
  ADMIN_IMPERSONATE: "admin.impersonate",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface AuthorizationSubject {
  userId: string;
  permissionCodes: string[];
  scopeType: ScopeType;
  scopeId?: string;
}

export interface AuthorizationResource {
  ownerUserId?: string;
  organizationId?: string;
  branchId?: string;
}

export function can(
  subject: AuthorizationSubject,
  permission: PermissionCode | string,
  resource: AuthorizationResource = {},
): boolean {
  if (subject.permissionCodes.includes(PERMISSIONS.ALL)) return true;
  if (!subject.permissionCodes.includes(permission)) return false;

  switch (subject.scopeType) {
    case "global":
      return true;
    case "self":
      return resource.ownerUserId === undefined || resource.ownerUserId === subject.userId;
    case "organization":
      return resource.organizationId === undefined || resource.organizationId === subject.scopeId;
    case "branch":
      return resource.branchId === undefined || resource.branchId === subject.scopeId;
  }
  return false;
}
