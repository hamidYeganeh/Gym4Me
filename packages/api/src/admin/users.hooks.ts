import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Paginated, PublicUser } from "../types";
import { createAdminUsersApi, type AdminUsersApi } from "./users.client";
import type {
  AdminCreateUserInput,
  AdminUpdateUserInput,
  AdminUpdateUserRolesInput,
  AdminUpdateUserStatusInput,
  AdminUserActivationInput,
  ListAdminUsersQuery,
} from "./users.dto";
import { adminUsersKeys } from "./users.keys";

function useAdminUsersApi(): AdminUsersApi {
  const client = useApiClient();
  return useMemo(() => createAdminUsersApi(client), [client]);
}

export function useAdminUsersList(
  query: ListAdminUsersQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<PublicUser>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminUsersApi();
  return useQuery({
    queryKey: adminUsersKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useAdminUser(
  userId: string,
  options?: Omit<UseQueryOptions<PublicUser, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminUsersApi();
  return useQuery({
    queryKey: adminUsersKeys.detail(userId),
    queryFn: () => api.get(userId),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateAdminUser(
  options?: UseMutationOptions<PublicUser, Error, AdminCreateUserInput>,
) {
  const api = useAdminUsersApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.create(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminUser(
  options?: UseMutationOptions<
    PublicUser,
    Error,
    { userId: string; input: AdminUpdateUserInput }
  >,
) {
  const api = useAdminUsersApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ userId, input }) => api.update(userId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(vars.userId),
      });
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminUserStatus(
  options?: UseMutationOptions<
    PublicUser,
    Error,
    { userId: string; input: AdminUpdateUserStatusInput }
  >,
) {
  const api = useAdminUsersApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ userId, input }) => api.updateStatus(userId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(vars.userId),
      });
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useActivateAdminUser(
  options?: UseMutationOptions<
    PublicUser,
    Error,
    { userId: string; input?: AdminUserActivationInput }
  >,
) {
  const api = useAdminUsersApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ userId, input }) => api.activate(userId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(vars.userId),
      });
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useDeactivateAdminUser(
  options?: UseMutationOptions<
    PublicUser,
    Error,
    { userId: string; input?: AdminUserActivationInput }
  >,
) {
  const api = useAdminUsersApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ userId, input }) => api.deactivate(userId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(vars.userId),
      });
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminUserRoles(
  options?: UseMutationOptions<
    PublicUser,
    Error,
    { userId: string; input: AdminUpdateUserRolesInput }
  >,
) {
  const api = useAdminUsersApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ userId, input }) => api.updateRoles(userId, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(vars.userId),
      });
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useRemoveAdminUser(
  options?: UseMutationOptions<PublicUser, Error, string>,
) {
  const api = useAdminUsersApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (userId) => api.remove(userId),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
