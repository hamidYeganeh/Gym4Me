import type { CoachSlotStatus } from "../types";
import type { CoachConsultationPricing } from "./coaches.dto";

export type CoachSlotsRangeQuery = {
  /** ISO date (inclusive). */
  from: string;
  /** ISO date (inclusive; date-only means end of day). */
  to: string;
};

export type CoachSlotClub = {
  id: string;
  name: string;
  address: string | null;
};

export type CoachSlot = {
  id: string;
  coachUserId: string;
  startsAt: string;
  endsAt: string;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  travelBufferMinutes: number;
  status: CoachSlotStatus;
  club: CoachSlotClub | null;
};

export type CoachSlotsResponse = {
  pricing: { consultation: CoachConsultationPricing };
  slots: CoachSlot[];
};
