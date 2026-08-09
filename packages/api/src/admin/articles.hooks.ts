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
  createAdminArticlesApi,
  type AdminArticlesApi,
} from "./articles.client";
import type {
  AdminArticle,
  CreateArticleInput,
  ListAdminArticlesQuery,
  UpdateArticleInput,
} from "./articles.dto";
import { adminArticlesKeys } from "./articles.keys";

function useAdminArticlesApi(): AdminArticlesApi {
  const client = useApiClient();
  return useMemo(() => createAdminArticlesApi(client), [client]);
}

export function useAdminArticles(
  query: ListAdminArticlesQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<AdminArticle>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminArticlesApi();
  return useQuery({
    queryKey: adminArticlesKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useAdminArticle(
  id: string,
  options?: Omit<
    UseQueryOptions<AdminArticle, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminArticlesApi();
  return useQuery({
    queryKey: adminArticlesKeys.detail(id),
    queryFn: () => api.get(id),
    ...options,
  });
}

function useInvalidateAdminArticles() {
  const queryClient = useQueryClient();
  return () =>
    void queryClient.invalidateQueries({ queryKey: adminArticlesKeys.all });
}

export function useCreateAdminArticle(
  options?: UseMutationOptions<AdminArticle, Error, CreateArticleInput>,
) {
  const api = useAdminArticlesApi();
  const invalidate = useInvalidateAdminArticles();
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

export function useUpdateAdminArticle(
  options?: UseMutationOptions<
    AdminArticle,
    Error,
    { id: string; input: UpdateArticleInput }
  >,
) {
  const api = useAdminArticlesApi();
  const invalidate = useInvalidateAdminArticles();
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

export function useDeleteAdminArticle(
  options?: UseMutationOptions<{ deleted: boolean }, Error, { id: string }>,
) {
  const api = useAdminArticlesApi();
  const invalidate = useInvalidateAdminArticles();
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
