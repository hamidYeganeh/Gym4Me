import type {
  CoachSlot,
  CoachSlotClub,
  CoachSlotsRangeQuery,
} from "../discovery/coach-slots.dto";

export type { CoachSlot, CoachSlotClub, CoachSlotsRangeQuery };

export type CoachSlotInput = {
  startsAt: string;
  endsAt: string;
  /** Rest/preparation time reserved before the appointment. */
  bufferBeforeMinutes?: number;
  /** Rest/follow-up time reserved after the appointment. */
  bufferAfterMinutes?: number;
  /** Travel time reserved on both sides of an in-person appointment. */
  travelBufferMinutes?: number;
  /** In-person venue — must be a club the coach is affiliated with. */
  clubId?: string | null;
};

export type CreateCoachSlotsInput = {
  slots: CoachSlotInput[];
};

export type CoachSlotsListResponse = {
  slots: CoachSlot[];
};
