import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import { createAccountRolesApi, type AccountRolesApi } from "./roles.client";
import type { ApplyRoleInput, ApplyRoleResponse } from "./roles.dto";

function useAccountRolesApi(): AccountRolesApi {
  const client = useApiClient();
  return useMemo(() => createAccountRolesApi(client), [client]);
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
