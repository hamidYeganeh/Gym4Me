import type { ApiClient } from "../client";
import type { AnalyticsPeriod } from "../finance/finance.dto";
import type {
  CoachAnalyticsOverview,
  CoachLead,
  CoachLeadsPage,
  CoachMessage,
  CoachThread,
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
import { accountCoachingEndpoints as ep } from "./coaching.endpoint";

export function createAccountCoachingApi(client: ApiClient) {
  return {
    listStudents(query: ListStudentsQuery = {}) {
      return client.request<StudentsPage>(ep.students, { query });
    },

    analyticsOverview(period?: AnalyticsPeriod) {
      return client.request<CoachAnalyticsOverview>(ep.analyticsOverview, {
        query: period ? { period } : undefined,
      });
    },

    listLeads(query: ListCoachLeadsQuery = {}) {
      return client.request<CoachLeadsPage>(ep.leads, { query });
    },

    createLead(input: CreateCoachLeadInput) {
      return client.request<CoachLead>(ep.leads, {
        method: "POST",
        body: input,
      });
    },

    updateLead(leadId: string, input: UpdateCoachLeadInput) {
      return client.request<CoachLead>(ep.lead(leadId), {
        method: "PATCH",
        body: input,
      });
    },

    updateLeadStage(leadId: string, input: UpdateCoachLeadStageInput) {
      return client.request<CoachLead>(ep.leadStage(leadId), {
        method: "PATCH",
        body: input,
      });
    },

    // ── Coach messaging ─────────────────────────────────────────────────────

    listCoachThreads(query: ListThreadsQuery = {}) {
      return client.request<ThreadsPage>(ep.coachThreads, { query });
    },

    openCoachThread(athleteUserId: string) {
      return client.request<CoachThread>(ep.coachThreads, {
        method: "POST",
        body: { athleteUserId },
      });
    },

    listCoachThreadMessages(
      threadId: string,
      query: ListThreadMessagesQuery = {},
    ) {
      return client.request<ThreadMessagesPage>(ep.coachThread(threadId), {
        query,
      });
    },

    sendCoachThreadMessage(threadId: string, input: SendCoachMessageInput) {
      return client.request<CoachMessage>(ep.coachThread(threadId), {
        method: "POST",
        body: input,
      });
    },

    // ── Athlete coaching ────────────────────────────────────────────────────

    listMyCoaches(query: ListStudentsQuery = {}) {
      return client.request<StudentsPage>(ep.athleteCoaches, { query });
    },

    listMyPackages(query: ListPackagesQuery = {}) {
      return client.request<SessionPackagesPage>(ep.athletePackages, {
        query,
      });
    },

    listAthleteThreads(query: ListThreadsQuery = {}) {
      return client.request<ThreadsPage>(ep.athleteThreads, { query });
    },

    openAthleteThread(coachUserId: string) {
      return client.request<CoachThread>(ep.athleteThreads, {
        method: "POST",
        body: { coachUserId },
      });
    },

    listAthleteThreadMessages(
      threadId: string,
      query: ListThreadMessagesQuery = {},
    ) {
      return client.request<ThreadMessagesPage>(ep.athleteThread(threadId), {
        query,
      });
    },

    sendAthleteThreadMessage(threadId: string, input: SendCoachMessageInput) {
      return client.request<CoachMessage>(ep.athleteThread(threadId), {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AccountCoachingApi = ReturnType<typeof createAccountCoachingApi>;
