import type { Paginated } from "../types";

export type CalendarResourceType =
  | "club"
  | "space"
  | "slot"
  | "coach"
  | "class";

export type CalendarBlockReason =
  | "holiday"
  | "maintenance"
  | "coach_time_off"
  | "service"
  | "other";

export type CalendarBlock = {
  id: string;
  resource: { type: CalendarResourceType; id: string };
  reason: CalendarBlockReason;
  window: { from: string; to: string };
  note: string | null;
  createdBy: string;
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type ListCalendarBlocksQuery = {
  page?: number;
  page_size?: number;
  resourceType?: CalendarResourceType;
  resourceId?: string;
  from?: string;
  to?: string;
  status?: "active" | "inactive" | "archived";
};

export type UpsertCalendarBlockInput = {
  id?: string;
  resource: { type: CalendarResourceType; id: string };
  reason: CalendarBlockReason;
  window: { from: string; to: string };
  note?: string;
  status?: "active" | "inactive" | "archived";
};

export type CalendarBlocksPage = Paginated<CalendarBlock>;
