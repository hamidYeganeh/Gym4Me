import type {
  CoachSlot,
  CoachSlotClub,
  CoachSlotsRangeQuery,
} from "../discovery/coach-slots.dto";

export type { CoachSlot, CoachSlotClub, CoachSlotsRangeQuery };

export type CoachSlotInput = {
  startsAt: string;
  endsAt: string;
  /** In-person venue — must be a club the coach is affiliated with. */
  clubId?: string | null;
};

export type CreateCoachSlotsInput = {
  slots: CoachSlotInput[];
};

export type CoachSlotsListResponse = {
  slots: CoachSlot[];
};
