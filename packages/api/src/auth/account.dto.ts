import type { Role } from "../types";

export type LoginInput = {
  phone: string;
  password: string;
};

export type RequestOtpInput = {
  phone: string;
};

export type ConfirmOtpInput = {
  phone: string;
  code: string;
  firstName?: string;
  lastName?: string;
  referralCode?: string;
};

export type SwitchRoleInput = {
  role: Role;
  refreshToken?: string;
};

export type LogoutInput = {
  refreshToken?: string;
  all?: boolean;
};

export type ForgotPasswordInput = {
  phone: string;
};

export type ForgotPasswordConfirmInput = {
  phone: string;
  code: string;
};

export type ResetPasswordInput = {
  resetToken: string;
  password: string;
};

export type SetPasswordInput = {
  password: string;
  currentPassword?: string;
};

export type OtpRequested = {
  expiresInSeconds: number;
  /** @deprecated Never returned by API; OTP is logged server-side in DEBUG_MODE only. */
  debugCode?: string;
};

export type ForgotPasswordConfirmed = {
  resetToken: string;
};
