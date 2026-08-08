/** Media upload / resolve helpers (`/media`). */
export const mediaEndpoints = {
  root: "/media",
  byId: (id: string) => `/media/${id}`,
  file: (id: string) => `/media/${id}/file`,
} as const;
