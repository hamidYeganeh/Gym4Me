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
