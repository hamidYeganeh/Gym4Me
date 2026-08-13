export const clubStaffEndpoints = {
  root: (clubId: string) => `/account/clubs/${clubId}/staff`,
  byId: (clubId: string, staffId: string) =>
    `/account/clubs/${clubId}/staff/${staffId}`,
} as const;
