/** Admin banners (`/admin/banners`). */
export const adminBannersEndpoints = {
  root: "/admin/banners",
  byId: (id: string) => `/admin/banners/${id}`,
} as const;
