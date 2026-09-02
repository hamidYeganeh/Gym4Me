import type { ApiMeta } from "../../core/contracts";
import type { ApiClient } from "../../core/client";
import type { ApiEntity, AdminRoleInput, AdminUserListParams } from "./types";
const e = encodeURIComponent;
export const adminAccessApi = {
  users: async (c: ApiClient, p: AdminUserListParams = {}, s?: AbortSignal) => {
    const response = await c.get<ApiEntity[]>("/admin/access/users", {
      query: p as any,
      ...(s ? { signal: s } : {}),
    });
    return {
      items: response.data,
      meta: response.meta,
      pagination: (response.meta as ApiMeta & { pagination?: any }).pagination,
    };
  },
  createUser: async (
    c: ApiClient,
    input: {
      mobile: string;
      profile?: { first_name?: string; last_name?: string };
      status?: string;
    },
  ) => (await c.post<ApiEntity>("/admin/access/users", input)).data,
  patchUser: async (c: ApiClient, id: string, input: ApiEntity) =>
    (await c.patch<ApiEntity>(`/admin/access/users/${e(id)}`, input)).data,
  permissions: async (c: ApiClient, s?: AbortSignal) =>
    (await c.get<ApiEntity[]>("/admin/access/permissions", s ? { signal: s } : undefined)).data,
  roles: async (c: ApiClient, s?: AbortSignal) =>
    (await c.get<ApiEntity[]>("/admin/access/roles", s ? { signal: s } : undefined)).data,
  createRole: async (c: ApiClient, input: AdminRoleInput) =>
    (await c.post<ApiEntity>("/admin/access/roles", input)).data,
  patchRole: async (c: ApiClient, id: string, input: Partial<AdminRoleInput>) =>
    (await c.patch<ApiEntity>(`/admin/access/roles/${e(id)}`, input)).data,
  assign: async (
    c: ApiClient,
    input: {
      user_id: string;
      role_id: string;
      scope: { type: "global" | "self" | "organization" | "branch"; id?: string };
      expires_at?: string;
    },
  ) => (await c.post<ApiEntity>("/admin/access/assignments", input)).data,
  revoke: async (c: ApiClient, id: string) =>
    (await c.delete<ApiEntity>(`/admin/access/assignments/${e(id)}`)).data,
  impersonate: async (c: ApiClient, id: string) =>
    (await c.post<ApiEntity>(`/admin/access/users/${e(id)}/impersonate`)).data,
};
