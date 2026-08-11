import type { Paginated } from "../types";

export type OwnerTaskStatus =
  | "open"
  | "in_progress"
  | "done"
  | "cancelled";

export type OwnerTaskPriority = "low" | "normal" | "high";

export type OwnerTask = {
  id: string;
  clubId: string;
  title: string;
  body: string | null;
  status: OwnerTaskStatus;
  priority: OwnerTaskPriority;
  assigneeUserId: string | null;
  createdByUserId: string;
  dueAt: string | null;
  related: {
    membershipId: string | null;
    debtId: string | null;
    bookingId: string | null;
    staffId: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type OwnerTasksSummary = { openCount: number };

export type ListOwnerTasksQuery = {
  page?: number;
  page_size?: number;
  status?: OwnerTaskStatus;
};

export type CreateOwnerTaskInput = {
  title: string;
  body?: string;
  priority?: OwnerTaskPriority;
  assigneeUserId?: string;
  dueAt?: string;
};

export type UpdateOwnerTaskStatusInput = {
  status: OwnerTaskStatus;
};

export type OwnerTasksPage = Paginated<OwnerTask>;
