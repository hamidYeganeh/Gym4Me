/** Admin ops user management (`/admin/users`). */
export const adminUsersEndpoints = {
  root: "/admin/users",
  byId: (userId: string) => `/admin/users/${userId}`,
  status: (userId: string) => `/admin/users/${userId}/status`,
  activate: (userId: string) => `/admin/users/${userId}/activate`,
  deactivate: (userId: string) => `/admin/users/${userId}/deactivate`,
  roles: (userId: string) => `/admin/users/${userId}/roles`,
} as const;
