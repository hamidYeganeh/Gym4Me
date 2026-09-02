"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { adminAccessApi } from "./api";
import { adminAccessKeys } from "./queries";
import type { AdminRoleInput, ApiEntity } from "./types";
export function useCreateAdminUserMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      mobile: string;
      profile?: { first_name?: string; last_name?: string };
      status?: string;
    }) => adminAccessApi.createUser(c, input),
    onSuccess: () => q.invalidateQueries({ queryKey: adminAccessKeys.all }),
  });
}
export function usePatchAdminUserMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApiEntity }) =>
      adminAccessApi.patchUser(c, id, input),
    onSuccess: () => q.invalidateQueries({ queryKey: adminAccessKeys.all }),
  });
}
export function useCreateAdminRoleMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminRoleInput) => adminAccessApi.createRole(c, input),
    onSuccess: () => q.invalidateQueries({ queryKey: adminAccessKeys.roles }),
  });
}
export function useAssignAdminRoleMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      user_id: string;
      role_id: string;
      scope: { type: "global" | "self" | "organization" | "branch"; id?: string };
    }) => adminAccessApi.assign(c, input),
    onSuccess: () => q.invalidateQueries({ queryKey: adminAccessKeys.all }),
  });
}
export function useRevokeAdminRoleMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAccessApi.revoke(c, id),
    onSuccess: () => q.invalidateQueries({ queryKey: adminAccessKeys.all }),
  });
}
export function useImpersonateMutation() {
  const c = useApiClient();
  return useMutation({ mutationFn: (id: string) => adminAccessApi.impersonate(c, id) });
}
