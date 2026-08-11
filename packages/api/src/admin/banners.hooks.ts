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
import {
  createAdminBannersApi,
  type AdminBannersApi,
} from "./banners.client";
import type {
  AdminBanner,
  CreateBannerInput,
  ListAdminBannersQuery,
  UpdateBannerInput,
} from "./banners.dto";
import { adminBannersKeys } from "./banners.keys";

function useAdminBannersApi(): AdminBannersApi {
  const client = useApiClient();
  return useMemo(() => createAdminBannersApi(client), [client]);
}

export function useAdminBanners(
  query: ListAdminBannersQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<AdminBanner>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminBannersApi();
  return useQuery({
    queryKey: adminBannersKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useAdminBanner(
  id: string,
  options?: Omit<UseQueryOptions<AdminBanner, Error>, "queryKey" | "queryFn">,
) {
  const api = useAdminBannersApi();
  return useQuery({
    queryKey: adminBannersKeys.detail(id),
    queryFn: () => api.get(id),
    ...options,
  });
}

function useInvalidateAdminBanners() {
  const queryClient = useQueryClient();
  return () =>
    void queryClient.invalidateQueries({ queryKey: adminBannersKeys.all });
}

export function useCreateAdminBanner(
  options?: UseMutationOptions<AdminBanner, Error, CreateBannerInput>,
) {
  const api = useAdminBannersApi();
  const invalidate = useInvalidateAdminBanners();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.create(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminBanner(
  options?: UseMutationOptions<
    AdminBanner,
    Error,
    { id: string; input: UpdateBannerInput }
  >,
) {
  const api = useAdminBannersApi();
  const invalidate = useInvalidateAdminBanners();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.update(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useDeleteAdminBanner(
  options?: UseMutationOptions<{ deleted: boolean }, Error, { id: string }>,
) {
  const api = useAdminBannersApi();
  const invalidate = useInvalidateAdminBanners();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id }) => api.delete(id),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
