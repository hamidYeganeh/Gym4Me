export const adminSocialEndpoints = {
  reports: "/admin/social/reports",
  resolveReport: (id: string) => `/admin/social/reports/${id}/resolve`,
} as const;
