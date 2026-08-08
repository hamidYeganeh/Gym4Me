/** Club-owner facing API (`/club_owner/clubs`). */
export const accountClubsEndpoints = {
  root: "/club_owner/clubs",
  byId: (clubId: string) => `/club_owner/clubs/${clubId}`,
  activate: (clubId: string) => `/club_owner/clubs/${clubId}/activate`,
  deactivate: (clubId: string) => `/club_owner/clubs/${clubId}/deactivate`,
  submit: (clubId: string) => `/club_owner/clubs/${clubId}/submit`,
  reviews: (clubId: string) => `/club_owner/clubs/${clubId}/reviews`,
  replyReview: (clubId: string, reviewId: string) =>
    `/club_owner/clubs/${clubId}/reviews/${reviewId}/reply`,
  branches: (clubId: string) => `/club_owner/clubs/${clubId}/branches`,
  classes: (clubId: string) => `/club_owner/clubs/${clubId}/classes`,
  classById: (clubId: string, classId: string) =>
    `/club_owner/clubs/${clubId}/classes/${classId}`,
  coaches: (clubId: string) => `/club_owner/clubs/${clubId}/coaches`,
  coachById: (clubId: string, coachId: string) =>
    `/club_owner/clubs/${clubId}/coaches/${coachId}`,
} as const;
