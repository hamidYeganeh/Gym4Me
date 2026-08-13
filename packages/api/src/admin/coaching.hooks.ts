import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAdminCoachingApi,
  type AdminCoachingApi,
} from "./coaching.client";
import type {
  AdminCoachServicesPage,
  AdminCoachStudentsPage,
  AdminHealthAssessment,
  AdminListCoachingQuery,
  AdminSessionPackagesPage,
} from "./coaching.dto";
import { adminCoachingKeys } from "./coaching.keys";

function useAdminCoachingApi(): AdminCoachingApi {
  const client = useApiClient();
  return useMemo(() => createAdminCoachingApi(client), [client]);
}

export function useAdminCoachServices(
  query: AdminListCoachingQuery = {},
  options?: Omit<
    UseQueryOptions<AdminCoachServicesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminCoachingApi();
  return useQuery({
    queryKey: adminCoachingKeys.services(query),
    queryFn: () => api.listServices(query),
    ...options,
  });
}

export function useAdminSessionPackages(
  query: AdminListCoachingQuery = {},
  options?: Omit<
    UseQueryOptions<AdminSessionPackagesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminCoachingApi();
  return useQuery({
    queryKey: adminCoachingKeys.packages(query),
    queryFn: () => api.listPackages(query),
    ...options,
  });
}

export function useAdminCoachStudents(
  query: AdminListCoachingQuery = {},
  options?: Omit<
    UseQueryOptions<AdminCoachStudentsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminCoachingApi();
  return useQuery({
    queryKey: adminCoachingKeys.students(query),
    queryFn: () => api.listStudents(query),
    ...options,
  });
}

export function useAdminHealthAssessment(
  athleteUserId: string,
  options?: Omit<
    UseQueryOptions<AdminHealthAssessment, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminCoachingApi();
  return useQuery({
    queryKey: adminCoachingKeys.healthAssessment(athleteUserId),
    queryFn: () => api.getHealthAssessment(athleteUserId),
    ...options,
    enabled: Boolean(athleteUserId) && (options?.enabled ?? true),
  });
}
