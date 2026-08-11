import type {
  ClubClass,
  ClubSlot,
  ClubSpace,
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
  space: {
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
  /** Seats still available on this occurrence. */
  remaining: number;
  /** Price per seat (Tomans); 0 = free. */
  price: number;
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

export type { ClubClass, ClubSpace };
