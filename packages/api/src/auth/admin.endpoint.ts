/** Admin ops auth — Vite admin app (`/admin/account/auth`). */
export const authAdminEndpoints = {
  otp: "/admin/account/auth/otp",
  otpConfirm: "/admin/account/auth/otp/confirm",
  login: "/admin/account/auth/login",
  refresh: "/admin/account/auth/refresh",
  logout: "/admin/account/auth/logout",
  forgotPassword: "/admin/account/auth/forgot-password",
  forgotPasswordConfirm: "/admin/account/auth/forgot-password/confirm",
  forgotPasswordReset: "/admin/account/auth/forgot-password/reset",
} as const;
