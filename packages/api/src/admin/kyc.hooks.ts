import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Paginated } from "../types";
import { createAdminKycApi, type AdminKycApi } from "./kyc.client";
import type {
  AdminKycRequest,
  ListAdminKycQuery,
  ReviewKycInput,
} from "./kyc.dto";
import { adminKycKeys } from "./kyc.keys";

function useAdminKycApi(): AdminKycApi {
  const client = useApiClient();
  return useMemo(() => createAdminKycApi(client), [client]);
}

export function useAdminKycList(
  query: ListAdminKycQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<AdminKycRequest>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminKycApi();
  return useQuery({
    queryKey: adminKycKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useReviewAdminKyc(
  options?: UseMutationOptions<
    AdminKycRequest,
    Error,
    { id: string; input: ReviewKycInput }
  >,
) {
  const api = useAdminKycApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.review(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: adminKycKeys.lists() });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
