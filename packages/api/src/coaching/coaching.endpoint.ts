export const accountCoachingEndpoints = {
  students: "/account/coaching/students",
  student: (id: string) => `/account/coaching/students/${id}`,
  analyticsOverview: "/account/coaching/analytics/overview",
  leads: "/account/coaching/leads",
  lead: (leadId: string) => `/account/coaching/leads/${leadId}`,
  leadStage: (leadId: string) => `/account/coaching/leads/${leadId}/stage`,
  // ── Coach messaging ─────────────────────────────────────────────────────
  coachThreads: "/account/coaching/messages/threads",
  coachThread: (threadId: string) =>
    `/account/coaching/messages/threads/${threadId}`,
  // ── Athlete coaching ────────────────────────────────────────────────────
  athleteCoaches: "/account/athlete/coaching/coaches",
  athletePackages: "/account/athlete/coaching/packages",
  athleteThreads: "/account/athlete/coaching/messages/threads",
  athleteThread: (threadId: string) =>
    `/account/athlete/coaching/messages/threads/${threadId}`,
} as const;
