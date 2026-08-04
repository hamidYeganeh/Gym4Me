export { ApiClient, createApiClient, type ApiClientOptions, type RequestOptions } from "./client";
export { ApiError } from "./errors";
export {
  ACCOUNT_SESSION_KEY,
  ADMIN_SESSION_KEY,
  createLocalStorage,
  createMemoryStorage,
  type TokenStorage,
} from "./storage";
export type {
  ApiErrorBody,
  AuthSession,
  KycStatus,
  PublicUser,
  Role,
  TokenPair,
  UserStatus,
} from "./types";
export {
  createAccountAuthApi,
  createAdminAuthApi,
  type AccountAuthApi,
  type AdminAuthApi,
  type AdminConfirmOtpInput,
  type ConfirmOtpInput,
  type ForgotPasswordConfirmInput,
  type ForgotPasswordInput,
  type LoginInput,
  type LogoutInput,
  type OtpRequested,
  type RequestOtpInput,
  type ResetPasswordInput,
  type SetPasswordInput,
  type SwitchRoleInput,
} from "./auth";
