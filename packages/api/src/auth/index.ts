export {
  createAccountAuthApi,
  type AccountAuthApi,
} from "./account.client";
export { authAccountEndpoints } from "./account.endpoint";
export type {
  ConfirmOtpInput,
  ForgotPasswordConfirmInput,
  ForgotPasswordConfirmed,
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  OtpRequested,
  RequestOtpInput,
  ResetPasswordInput,
  SetPasswordInput,
  SwitchRoleInput,
} from "./account.dto";
export { authAccountKeys } from "./account.keys";

export {
  createAdminAuthApi,
  type AdminAuthApi,
} from "./admin.client";
export { authAdminEndpoints } from "./admin.endpoint";
export type { AdminConfirmOtpInput } from "./admin.dto";
export { authAdminKeys } from "./admin.keys";
