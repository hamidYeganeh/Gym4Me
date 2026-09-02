/** Admin ops auth — Vite admin app (`/admin/account/auth`). */
export const authAdminEndpoints = {
  otp: "/account/auth/otp/request",
  otpConfirm: "/account/auth/otp/verify",
  login: "/account/auth/password/login",
  refresh: "/account/auth/token/refresh",
  logout: "/account/auth/logout",
  logoutAll: "/account/auth/logout-all",
  forgotPassword: "/account/auth/password/recovery/request",
  forgotPasswordConfirm: "/account/auth/password/recovery/verify",
  forgotPasswordReset: "/account/auth/password/recovery/reset",
} as const;
