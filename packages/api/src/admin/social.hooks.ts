import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAdminSocialApi,
  type AdminSocialApi,
} from "./social.client";
import type {
  AdminSocialReportsPage,
  ListAdminSocialReportsQuery,
  ResolveSocialReportInput,
} from "./social.dto";
import { adminSocialKeys } from "./social.keys";

function useAdminSocialApi(): AdminSocialApi {
  const client = useApiClient();
  return useMemo(() => createAdminSocialApi(client), [client]);
}

export function useAdminSocialReports(
  query: ListAdminSocialReportsQuery = {},
  options?: Omit<
    UseQueryOptions<AdminSocialReportsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminSocialApi();
  return useQuery({
    queryKey: adminSocialKeys.reports(query),
    queryFn: () => api.listReports(query),
    ...options,
  });
}

export function useResolveAdminSocialReport() {
  const api = useAdminSocialApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: ResolveSocialReportInput;
    }) => api.resolveReport(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminSocialKeys.all });
    },
  });
}
