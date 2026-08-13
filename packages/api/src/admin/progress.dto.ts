import type { Paginated } from "../types";
import type {
  Exercise,
  ExerciseStatus,
  MetricType,
  MetricTypeStatus,
  MetricValueKind,
} from "../progress/progress.dto";

export type { Exercise, MetricType };

export type ListAdminExercisesQuery = {
  page?: number;
  page_size?: number;
  status?: ExerciseStatus;
  search?: string;
};

export type CreateExerciseInput = {
  name: string;
  description?: string;
  muscleKeys?: string[];
  equipmentKeys?: string[];
  mediaId?: string;
  status?: ExerciseStatus;
};

export type UpdateExerciseInput = Partial<CreateExerciseInput>;

export type VerifyExerciseInput = {
  status: "approved" | "rejected";
  rejectionReason?: string;
};

export type AdminExercisesPage = Paginated<Exercise>;

export type ListAdminMetricTypesQuery = {
  page?: number;
  page_size?: number;
  status?: MetricTypeStatus;
  search?: string;
};

export type CreateMetricTypeInput = {
  key: string;
  name: string;
  valueKind: MetricValueKind;
  unit?: string;
  sportId?: string;
  status?: MetricTypeStatus;
  sortHint?: number;
  chartKind?: string;
};

export type UpdateMetricTypeInput = Partial<
  Omit<CreateMetricTypeInput, "key">
>;

export type AdminMetricTypesPage = Paginated<MetricType>;
