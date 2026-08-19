import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Role } from "../types";
import { createAccountRolesApi, type AccountRolesApi } from "./roles.client";
import type {
  ApplyRoleInput,
  ApplyRoleResponse,
  RoleOverviewResponse,
  SubmitRoleRequestInput,
  SubmitRoleRequestResponse,
} from "./roles.dto";
import { accountRolesKeys } from "./roles.keys";

function useAccountRolesApi(): AccountRolesApi {
  const client = useApiClient();
  return useMemo(() => createAccountRolesApi(client), [client]);
}

export function useAccountRolesOverview(
  options?: Omit<
    UseQueryOptions<RoleOverviewResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountRolesApi();
  return useQuery({
    queryKey: accountRolesKeys.overview(),
    queryFn: () => api.list(),
    ...options,
  });
}

export function useApplyAccountRole(
  options?: UseMutationOptions<ApplyRoleResponse, Error, ApplyRoleInput>,
) {
  const api = useAccountRolesApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.apply(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useSubmitAccountRoleRequest(
  options?: UseMutationOptions<
    SubmitRoleRequestResponse,
    Error,
    { role: Role; input: SubmitRoleRequestInput }
  >,
) {
  const api = useAccountRolesApi();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ role, input }) => api.submit(role, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
