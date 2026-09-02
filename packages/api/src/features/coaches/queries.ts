"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { coachesApi } from "./api";
import type { CoachSearchParams } from "./types";
export const coachKeys = {
  all: ["coaches"] as const,
  list: (p: CoachSearchParams) => ["coaches", "catalog", p] as const,
  detail: (id: string) => ["coaches", "detail", id] as const,
  me: ["coaches", "me"] as const,
  myOfferings: ["coaches", "me", "offerings"] as const,
  mySettlements: ["coaches", "me", "settlements"] as const,
  relationships: ["coaching", "me"] as const,
  messages: (id: string) => ["coaching", "relationships", id, "messages"] as const,
  admin: (p: CoachSearchParams) => ["admin", "coaches", p] as const,
};
export function useCoachesQuery(params: CoachSearchParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: coachKeys.list(params),
    queryFn: ({ signal }) => coachesApi.list(c, params, signal),
  });
}
export function useCoachQuery(id: string) {
  const c = useApiClient();
  return useQuery({
    queryKey: coachKeys.detail(id),
    queryFn: ({ signal }) => coachesApi.detail(c, id, signal),
    enabled: Boolean(id),
  });
}
export function useMyCoachProfileQuery(options: { enabled?: boolean } = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: coachKeys.me,
    queryFn: ({ signal }) => coachesApi.me(c, signal),
    enabled: options.enabled ?? true,
  });
}
export function useMyCoachOfferingsQuery(options: { enabled?: boolean } = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: coachKeys.myOfferings,
    queryFn: ({ signal }) => coachesApi.myOfferings(c, signal),
    enabled: options.enabled ?? true,
  });
}
export function useMyCoachSettlementsQuery(options: { enabled?: boolean } = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: coachKeys.mySettlements,
    queryFn: ({ signal }) => coachesApi.mySettlements(c, signal),
    enabled: options.enabled ?? true,
  });
}
export function useCoachingRelationshipsQuery(options: { enabled?: boolean } = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: coachKeys.relationships,
    queryFn: ({ signal }) => coachesApi.relationships(c, signal),
    enabled: options.enabled ?? true,
  });
}
export function useCoachingMessagesQuery(id: string, options: { enabled?: boolean } = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: coachKeys.messages(id),
    queryFn: ({ signal }) => coachesApi.messages(c, id, signal),
    enabled: (options.enabled ?? true) && Boolean(id),
  });
}
export function useAdminCoachesQuery(params: CoachSearchParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: coachKeys.admin(params),
    queryFn: ({ signal }) => coachesApi.adminList(c, params, signal),
  });
}
