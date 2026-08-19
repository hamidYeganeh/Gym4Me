/** Account role membership (`/account/roles`). */
export const accountRolesEndpoints = {
  list: "/account/roles",
  apply: "/account/roles/apply",
  submit: (role: string) => `/account/roles/${role}/submit`,
} as const;
