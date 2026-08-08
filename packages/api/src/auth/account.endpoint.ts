/** Account auth — mobile / multi-role app (`/account/auth`). */
export const authAccountEndpoints = {
  otp: "/account/auth/otp",
  otpConfirm: "/account/auth/otp/confirm",
  login: "/account/auth/login",
  refresh: "/account/auth/refresh",
  switchRole: "/account/auth/switch-role",
  logout: "/account/auth/logout",
  forgotPassword: "/account/auth/forgot-password",
  forgotPasswordConfirm: "/account/auth/forgot-password/confirm",
  forgotPasswordReset: "/account/auth/forgot-password/reset",
  setPassword: "/account/auth/set-password",
} as const;
