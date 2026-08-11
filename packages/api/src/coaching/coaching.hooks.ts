import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import type { AnalyticsPeriod } from "../finance/finance.dto";
import { useApiClient } from "../react";
import {
  createAccountCoachingApi,
  type AccountCoachingApi,
} from "./coaching.client";
import type {
  CoachAnalyticsOverview,
  ListStudentsQuery,
  StudentsPage,
} from "./coaching.dto";
import { accountCoachingKeys } from "./coaching.keys";

function useAccountCoachingApi(): AccountCoachingApi {
  const client = useApiClient();
  return useMemo(() => createAccountCoachingApi(client), [client]);
}

export function useCoachStudents(
  query: ListStudentsQuery = {},
  options?: Omit<
    UseQueryOptions<StudentsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountCoachingApi();
  return useQuery({
    queryKey: accountCoachingKeys.students(query),
    queryFn: () => api.listStudents(query),
    ...options,
  });
}

export function useCoachAnalyticsOverview(
  period?: AnalyticsPeriod,
  options?: Omit<
    UseQueryOptions<CoachAnalyticsOverview, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountCoachingApi();
  return useQuery({
    queryKey: accountCoachingKeys.analytics(period),
    queryFn: () => api.analyticsOverview(period),
    ...options,
  });
}
