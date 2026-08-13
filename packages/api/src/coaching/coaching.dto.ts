import type { Paginated } from "../types";
import type { AnalyticsPeriod } from "../finance/finance.dto";

export type CoachStudentStatus = "active" | "paused" | "ended";
export type CoachStudentEngagementLevel = "healthy" | "at_risk" | "quiet";

export type CoachStudent = {
  id: string;
  coachUserId: string;
  athleteUserId: string;
  status: CoachStudentStatus;
  coaching: {
    goalKey: string | null;
    levelKey: string | null;
  };
  engagement: {
    level: CoachStudentEngagementLevel;
    progressPercent: number | null;
    scoredAt: string | null;
    lastSessionAt: string | null;
  };
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListStudentsQuery = {
  page?: number;
  page_size?: number;
  status?: CoachStudentStatus;
  engagementLevel?: CoachStudentEngagementLevel;
};

export type CoachAnalyticsOverview = {
  period: AnalyticsPeriod;
  kpis: {
    sessionsSeries: number[];
    sessionsValue: string;
    activeClientsSeries: number[];
    activeClientsValue: string;
    retentionSeries: number[];
    retentionComparisonSeries: number[];
    retentionValue: string;
    cancellationsSeries: number[];
    cancellationsValue: string;
  };
  engagement: {
    healthy: number;
    atRisk: number;
    quiet: number;
    total: number;
    active: number;
  };
};

export type StudentsPage = Paginated<CoachStudent>;

// ── Coach ↔ athlete messaging ───────────────────────────────────────────────

export type CoachThread = {
  id: string;
  coachUserId: string;
  athleteUserId: string;
  status: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CoachMessage = {
  id: string;
  threadId: string;
  senderUserId: string;
  senderRole: "coach" | "athlete" | string;
  body: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ListThreadsQuery = {
  page?: number;
  page_size?: number;
};

export type ListThreadMessagesQuery = {
  page?: number;
  page_size?: number;
};

export type SendCoachMessageInput = {
  body: string;
};

export type ThreadsPage = Paginated<CoachThread>;
export type ThreadMessagesPage = Paginated<CoachMessage>;

// ── Session packages (athlete view) ─────────────────────────────────────────

export type SessionPackageStatus =
  | "active"
  | "frozen"
  | "exhausted"
  | "expired"
  | "cancelled";

export type SessionPackage = {
  id: string;
  coachUserId: string;
  athleteUserId: string;
  serviceId: string | null;
  sessions: { total: number; used: number };
  validity: {
    expiresAt: string;
    freeze: { frozenAt: string; unfreezeAt: string | null } | null;
  };
  status: SessionPackageStatus | string;
  pricing: unknown;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListPackagesQuery = {
  page?: number;
  page_size?: number;
  status?: SessionPackageStatus;
  coachUserId?: string;
};

export type SessionPackagesPage = Paginated<SessionPackage>;
