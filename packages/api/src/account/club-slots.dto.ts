import type { ItemsResponse } from "../types";

export type EntityStatus = "active" | "inactive" | "archived";
export type SlotKind = "class" | "session";
export type SlotRecurrenceType = "weekly" | "once";
export type SlotExceptionStatus = "cancelled";
export type OccurrenceStatus = "scheduled" | "cancelled";

export type ClubClassMedia = {
  coverMediaId: string | null;
};

export type ClubClass = {
  id: string;
  clubId: string;
  title: string;
  description: string | null;
  sportId: string | null;
  coachId: string | null;
  coach?: Record<string, unknown> | null;
  media: ClubClassMedia;
  status: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type SlotRecurrence = {
  type: SlotRecurrenceType;
  weekday?: number | null;
  date?: string | null;
  startTime: string;
  endTime: string;
  startsOn?: string | null;
  endsOn?: string | null;
};

export type SlotException = {
  date: string;
  status: SlotExceptionStatus;
};

export type SlotSchedule = {
  recurrence: SlotRecurrence;
  exceptions: SlotException[];
};

export type ClubSlot = {
  id: string;
  clubId: string;
  kind: SlotKind;
  classId: string | null;
  coachId: string | null;
  capacity: number;
  schedule: SlotSchedule;
  status: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateClubClassInput = {
  title: string;
  description?: string;
  sportId?: string | null;
  coachId?: string | null;
  media?: { coverMediaId?: string | null };
  status?: EntityStatus;
};

export type UpdateClubClassInput = Partial<CreateClubClassInput>;

export type CreateClubSlotInput = {
  kind: SlotKind;
  classId?: string;
  coachId?: string | null;
  capacity: number;
  schedule: {
    recurrence: SlotRecurrence;
    exceptions?: SlotException[];
  };
  status?: EntityStatus;
};

export type UpdateClubSlotInput = Omit<
  Partial<CreateClubSlotInput>,
  "classId"
> & {
  /** Pass null to detach the class when switching kind to session. */
  classId?: string | null;
};

export type CancelSlotOccurrenceInput = {
  date: string;
};

export type ClubClassesList = ItemsResponse<ClubClass>;
export type ClubSlotsList = ItemsResponse<ClubSlot>;
