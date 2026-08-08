import type { KycStatus, Role, UserStatus } from "../types";

export type ListAdminUsersQuery = {
  page?: number;
  limit?: number;
  role?: Role;
  status?: UserStatus;
  kycStatus?: KycStatus;
  search?: string;
};

export type AdminCreateUserInput = {
  phone: string;
  firstName?: string;
  lastName?: string;
  roles?: Role[];
  password?: string;
};

export type AdminUpdateUserInput = {
  firstName?: string;
  lastName?: string;
  nationalId?: string;
};

export type AdminUpdateUserStatusInput = {
  status: UserStatus;
  reason?: string;
};

export type AdminUpdateUserRolesInput = {
  roles: Role[];
};

export type AdminUserActivationInput = {
  reason?: string;
};
