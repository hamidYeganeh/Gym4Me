/** Mirrors `Role` in apps/api — keep in sync with product decisions. */
export type Role =
  | "athlete"
  | "coach"
  | "club_owner"
  | "club_staff"
  | "admin";

export type UserStatus = "active" | "blocked" | "deleted";

export type KycStatus = "none" | "pending" | "approved" | "rejected";

export type PublicUser = {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  nationalId: string | null;
  roles: Role[];
  code: string | null;
  referralCode: string | null;
  status: UserStatus;
  kycStatus: KycStatus;
  phoneVerifiedAt: string | null;
  createdAt: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSession = TokenPair & {
  activeRole: Role;
  user: PublicUser;
  isNewUser?: boolean;
};

export type ApiErrorBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};
