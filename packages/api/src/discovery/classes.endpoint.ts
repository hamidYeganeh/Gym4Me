/** Public discovery classes (`/discovery/classes`). */
export const discoveryClassesEndpoints = {
  root: "/discovery/classes",
  byId: (classId: string) => `/discovery/classes/${classId}`,
} as const;
