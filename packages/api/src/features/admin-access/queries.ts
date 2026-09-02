"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { adminAccessApi } from "./api";
import type { AdminUserListParams } from "./types";
export const adminAccessKeys = {
  all: ["admin-access"] as const,
  users: (params: AdminUserListParams) => ["admin-access", "users", params] as const,
  roles: ["admin-access", "roles"] as const,
  permissions: ["admin-access", "permissions"] as const,
};
export function useAdminUsersQuery(params: AdminUserListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: adminAccessKeys.users(params),
    queryFn: ({ signal }) => adminAccessApi.users(c, params, signal),
  });
}
export function useAdminRolesQuery() {
  const c = useApiClient();
  return useQuery({
    queryKey: adminAccessKeys.roles,
    queryFn: ({ signal }) => adminAccessApi.roles(c, signal),
  });
}
export function useAdminPermissionsQuery() {
  const c = useApiClient();
  return useQuery({
    queryKey: adminAccessKeys.permissions,
    queryFn: ({ signal }) => adminAccessApi.permissions(c, signal),
  });
}
