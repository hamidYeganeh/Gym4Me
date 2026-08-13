import type { Paginated } from "../types";
import type {
  CoachStudent,
  SessionPackage,
} from "../coaching/coaching.dto";

export type { CoachStudent, SessionPackage };

export type AdminListCoachingQuery = {
  page?: number;
  page_size?: number;
  coachUserId?: string;
  athleteUserId?: string;
};

export type AdminCoachService = {
  id: string;
  coachUserId: string;
  title: string;
  description: string | null;
  delivery: unknown;
  pricing: unknown;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCoachServicesPage = Paginated<AdminCoachService>;
export type AdminSessionPackagesPage = Paginated<SessionPackage>;
export type AdminCoachStudentsPage = Paginated<CoachStudent>;

export type AdminHealthAssessment = Record<string, unknown> | null;
