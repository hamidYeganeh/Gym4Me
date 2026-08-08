/** Admin coach/club verification (`/admin/coaches`, `/admin/clubs`). */
export const adminVerificationEndpoints = {
  coachVerifications: "/admin/coaches/verifications",
  coachVerification: (userId: string) =>
    `/admin/coaches/${userId}/verification`,
  clubVerificationList: "/admin/clubs/verification",
  clubVerification: (id: string) => `/admin/clubs/${id}/verification`,
} as const;
