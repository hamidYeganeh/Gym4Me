import {
  useMutation,
  useQuery,
  useQueryClient,
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
  CoachLead,
  CoachLeadsPage,
  CreateCoachLeadInput,
  ListCoachLeadsQuery,
  ListPackagesQuery,
  ListStudentsQuery,
  ListThreadMessagesQuery,
  ListThreadsQuery,
  SendCoachMessageInput,
  SessionPackagesPage,
  StudentsPage,
  ThreadMessagesPage,
  ThreadsPage,
  UpdateCoachLeadInput,
  UpdateCoachLeadStageInput,
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

export function useCoachLeads(
  query: ListCoachLeadsQuery = {},
  options?: Omit<UseQueryOptions<CoachLeadsPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountCoachingApi();
  return useQuery({
    queryKey: accountCoachingKeys.leads(query),
    queryFn: () => api.listLeads(query),
    ...options,
  });
}

function useInvalidateCoachLeads() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: accountCoachingKeys.all });
}

export function useCreateCoachLead() {
  const api = useAccountCoachingApi();
  const invalidate = useInvalidateCoachLeads();
  return useMutation<CoachLead, Error, CreateCoachLeadInput>({
    mutationFn: (input) => api.createLead(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCoachLead(leadId: string) {
  const api = useAccountCoachingApi();
  const invalidate = useInvalidateCoachLeads();
  return useMutation<CoachLead, Error, UpdateCoachLeadInput>({
    mutationFn: (input) => api.updateLead(leadId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateCoachLeadStage(leadId: string) {
  const api = useAccountCoachingApi();
  const invalidate = useInvalidateCoachLeads();
  return useMutation<CoachLead, Error, UpdateCoachLeadStageInput>({
    mutationFn: (input) => api.updateLeadStage(leadId, input),
    onSuccess: invalidate,
  });
}

// ── Coach messaging ─────────────────────────────────────────────────────────

export function useCoachThreads(
  query: ListThreadsQuery = {},
  options?: Omit<UseQueryOptions<ThreadsPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountCoachingApi();
  return useQuery({
    queryKey: accountCoachingKeys.coachThreads(query),
    queryFn: () => api.listCoachThreads(query),
    ...options,
  });
}

export function useCoachThreadMessages(
  threadId: string,
  query: ListThreadMessagesQuery = {},
  options?: Omit<
    UseQueryOptions<ThreadMessagesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountCoachingApi();
  return useQuery({
    queryKey: accountCoachingKeys.coachThreadMessages(threadId, query),
    queryFn: () => api.listCoachThreadMessages(threadId, query),
    ...options,
    enabled: Boolean(threadId) && (options?.enabled ?? true),
  });
}

export function useOpenCoachThread() {
  const api = useAccountCoachingApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (athleteUserId: string) => api.openCoachThread(athleteUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountCoachingKeys.all,
      });
    },
  });
}

export function useSendCoachThreadMessage(threadId: string) {
  const api = useAccountCoachingApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendCoachMessageInput) =>
      api.sendCoachThreadMessage(threadId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountCoachingKeys.all,
      });
    },
  });
}

// ── Athlete coaching ────────────────────────────────────────────────────────

export function useMyCoaches(
  query: ListStudentsQuery = {},
  options?: Omit<UseQueryOptions<StudentsPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountCoachingApi();
  return useQuery({
    queryKey: accountCoachingKeys.myCoaches(query),
    queryFn: () => api.listMyCoaches(query),
    ...options,
  });
}

export function useMySessionPackages(
  query: ListPackagesQuery = {},
  options?: Omit<
    UseQueryOptions<SessionPackagesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountCoachingApi();
  return useQuery({
    queryKey: accountCoachingKeys.myPackages(query),
    queryFn: () => api.listMyPackages(query),
    ...options,
  });
}

export function useAthleteThreads(
  query: ListThreadsQuery = {},
  options?: Omit<UseQueryOptions<ThreadsPage, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountCoachingApi();
  return useQuery({
    queryKey: accountCoachingKeys.athleteThreads(query),
    queryFn: () => api.listAthleteThreads(query),
    ...options,
  });
}

export function useAthleteThreadMessages(
  threadId: string,
  query: ListThreadMessagesQuery = {},
  options?: Omit<
    UseQueryOptions<ThreadMessagesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountCoachingApi();
  return useQuery({
    queryKey: accountCoachingKeys.athleteThreadMessages(threadId, query),
    queryFn: () => api.listAthleteThreadMessages(threadId, query),
    ...options,
    enabled: Boolean(threadId) && (options?.enabled ?? true),
  });
}

export function useOpenAthleteThread() {
  const api = useAccountCoachingApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (coachUserId: string) => api.openAthleteThread(coachUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountCoachingKeys.all,
      });
    },
  });
}

export function useSendAthleteThreadMessage(threadId: string) {
  const api = useAccountCoachingApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendCoachMessageInput) =>
      api.sendAthleteThreadMessage(threadId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountCoachingKeys.all,
      });
    },
  });
}
