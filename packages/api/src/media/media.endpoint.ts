/** Media upload / resolve helpers backed by the current asset service. */
export const mediaEndpoints = {
  root: "/uploads",
  byId: (id: string) => `/uploads/${id}`,
  privateFile: (id: string) => `/uploads/${id}/content`,
  publicFile: (id: string) => `/catalog/assets/${id}/content`,
} as const;
