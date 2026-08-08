/** Admin clubs API (`/admin/clubs`). */
export const adminClubsEndpoints = {
  root: "/admin/clubs",
  byId: (clubId: string) => `/admin/clubs/${clubId}`,
  activate: (clubId: string) => `/admin/clubs/${clubId}/activate`,
  deactivate: (clubId: string) => `/admin/clubs/${clubId}/deactivate`,
  verification: "/admin/clubs/verification",
  verificationById: (clubId: string) =>
    `/admin/clubs/${clubId}/verification`,
  reviews: (clubId: string) => `/admin/clubs/${clubId}/reviews`,
  reviewById: (clubId: string, reviewId: string) =>
    `/admin/clubs/${clubId}/reviews/${reviewId}`,
  achievements: (clubId: string) => `/admin/clubs/${clubId}/achievements`,
  branches: (clubId: string) => `/admin/clubs/${clubId}/branches`,
  classes: (clubId: string) => `/admin/clubs/${clubId}/classes`,
  classById: (clubId: string, classId: string) =>
    `/admin/clubs/${clubId}/classes/${classId}`,
  coaches: (clubId: string) => `/admin/clubs/${clubId}/coaches`,
  coachById: (clubId: string, coachId: string) =>
    `/admin/clubs/${clubId}/coaches/${coachId}`,
} as const;
