import type { LocationKind, RefType, SportKind } from "@repo/api";

export const routes = {
  signIn: "/sign-in",
  otp: "/otp",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  analytics: "/analytics",
  users: "/dashboard/users",
  usersKyc: "/dashboard/users/kyc",
  usersCoachVerifications: "/dashboard/users/coach-verifications",
  usersClubReviews: "/dashboard/users/club-reviews",
  user: (userId: string) => `/dashboard/users/${userId}`,
  clubs: "/dashboard/clubs",
  club: (clubId: string) => `/dashboard/clubs/${clubId}`,
  locations: (kind: LocationKind = "country") =>
    `/dashboard/locations/${kind}`,
  sports: (kind: SportKind = "category") => `/dashboard/sports/${kind}`,
  choices: "/dashboard/choices",
  refs: (type: RefType = "equipment") => `/dashboard/refs/${type}`,
  support: "/dashboard/support",
  supportFaq: "/dashboard/support/faq",
  articles: "/dashboard/articles",
} as const;
