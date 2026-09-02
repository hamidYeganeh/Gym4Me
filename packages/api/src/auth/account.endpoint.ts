/** Account auth — mobile / multi-role app (`/account/auth`). */
export const authAccountEndpoints = {
  otp: "/account/auth/otp/request",
  otpConfirm: "/account/auth/otp/verify",
  login: "/account/auth/password/login",
  refresh: "/account/auth/token/refresh",
  switchRole: "/account/access-context/activate",
  logout: "/account/auth/logout",
  logoutAll: "/account/auth/logout-all",
  forgotPassword: "/account/auth/password/recovery/request",
  forgotPasswordConfirm: "/account/auth/password/recovery/verify",
  forgotPasswordReset: "/account/auth/password/recovery/reset",
  setPassword: "/account/security/password/set",
} as const;
