import type { Paginated, Privacy } from "../types";

export type MetricValueKind =
  | "number"
  | "pair"
  | "range"
  | "ratio"
  | "text";

export type MetricTypeStatus = "active" | "archived";

export type WorkoutProgramStatus = "draft" | "published" | "archived";

export type WorkoutProgramOwnerType = "coach" | "admin" | "system";

export type MetricType = {
  id: string;
  key: string;
  name: string;
  valueKind: MetricValueKind;
  unit: string | null;
  sportId: string | null;
  status: MetricTypeStatus;
  sortHint: number;
  chartKind: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListMetricTypesQuery = {
  page?: number;
  page_size?: number;
  search?: string;
};

export type WorkoutProgramMeta = {
  focusLabel: string | null;
  weekCount: number | null;
  sessionsPerWeek: number | null;
};

export type WorkoutProgram = {
  id: string;
  owner: { type: WorkoutProgramOwnerType; id: string | null };
  title: string;
  status: WorkoutProgramStatus;
  privacy: Privacy;
  meta: WorkoutProgramMeta;
  assignedCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ListWorkoutProgramsQuery = {
  page?: number;
  page_size?: number;
  status?: WorkoutProgramStatus;
};

export type CreateWorkoutProgramInput = {
  title: string;
  status?: WorkoutProgramStatus;
  privacy?: Privacy;
  meta?: {
    focusLabel?: string;
    weekCount?: number;
    sessionsPerWeek?: number;
  };
};

export type UpdateWorkoutProgramInput = Partial<CreateWorkoutProgramInput>;

export type AssignWorkoutProgramInput = {
  athleteUserId: string;
};

export type MetricTypesPage = Paginated<MetricType>;
export type WorkoutProgramsPage = Paginated<WorkoutProgram>;
