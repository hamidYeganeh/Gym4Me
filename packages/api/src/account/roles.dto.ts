import type { PublicUser, Role, VerificationStatus } from "../types";

export type RoleRequestApplication = {
  bio: string | null;
  headline: string | null;
  yearsExperience: number | null;
  documentMediaIds: string[];
  note: string | null;
};

export type RoleRequestReview = {
  reviewedAt: string | null;
  reviewedBy: string | null;
  reason: string | null;
};

export type RoleRequest = {
  id: string;
  userId: string;
  role: Role;
  status: VerificationStatus;
  application: RoleRequestApplication;
  review: RoleRequestReview;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RoleAvailability = {
  role: Role;
  canSwitch: boolean;
  active: boolean;
};

export type RoleActionNextStep =
  | "switch"
  | "apply"
  | "submit"
  | "pending"
  | "rejected"
  | null;

export type RoleAction = {
  role: Role;
  hasRole: boolean;
  request: RoleRequest | null;
  nextStep: RoleActionNextStep;
};

export type RoleOverviewResponse = {
  roles: Role[];
  activeRole: Role;
  availabilities: RoleAvailability[];
  actions: RoleAction[];
};

export type ApplyRoleInput = {
  role: Role;
};

export type ApplyRoleResponse = {
  request: RoleRequest;
  nextStep: RoleActionNextStep;
};

/** @deprecated Use ApplyRoleResponse — kept for transitional imports. */
export type ApplyRoleLegacyResponse = {
  roles: Role[];
  applied: Role;
  user: PublicUser;
};

export type SubmitRoleRequestInput = {
  bio?: string;
  headline?: string;
  yearsExperience?: number;
  documentMediaIds: string[];
  note?: string;
};

export type SubmitRoleRequestResponse = {
  request: RoleRequest;
  nextStep: RoleActionNextStep;
};

export type ReviewRoleRequestInput = {
  action: "approve" | "reject";
  reviewNote?: string;
};

export type ListRoleRequestsQuery = {
  page?: number;
  limit?: number;
  page_size?: number;
  search?: string;
  status?: VerificationStatus | VerificationStatus[] | "all";
  role?: Role;
};

export type RoleRequestAdminItem = RoleRequest & {
  user: {
    id: string;
    phone?: string;
    name?: { first?: string; last?: string };
    code?: string | null;
    kycStatus?: string;
  };
};
