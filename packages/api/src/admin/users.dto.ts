import type {
  KycStatus,
  ListQuery,
  ListQueryFilter,
  Role,
  UserStatus,
} from "../types";

export type AdminUsersSortBy =
  | "createdAt"
  | "updatedAt"
  | "name"
  | "phone"
  | "code"
  | "status"
  | "kycStatus";

export type ListAdminUsersQuery = ListQuery<AdminUsersSortBy> & {
  role?: ListQueryFilter<Role>;
  status?: ListQueryFilter<UserStatus>;
  kycStatus?: ListQueryFilter<KycStatus>;
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
