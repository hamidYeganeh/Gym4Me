import type {
  ClubClass,
  ClubSlot,
  OccurrenceStatus,
  SlotKind,
} from "../account/club-slots.dto";

export type ClubCalendarQuery = {
  from: string;
  to: string;
};

export type { ClubSlot };

export type ClubCalendarOccurrence = {
  slotId: string;
  kind: SlotKind;
  class: {
    id: string;
    title: string;
    media: { coverMediaId: string | null };
  } | null;
  coach: {
    id: string;
    name: { first: string | null; last: string | null };
  } | null;
  startTime: string;
  endTime: string;
  capacity: number;
  occurrenceStatus: OccurrenceStatus;
};

export type ClubCalendarDay = {
  date: string;
  weekday: number;
  items: ClubCalendarOccurrence[];
};

export type ClubCalendarResponse = {
  timezone: string;
  days: ClubCalendarDay[];
};

export type { ClubClass };
