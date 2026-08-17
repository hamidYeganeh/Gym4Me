import type { ReserveDay, ReservePlan, ReserveSlot } from "../../lib/reserve-data";

export type DiscoveryClubsReserveReviewStepSectionProps = {
  clubTitle: string;
  activeDay?: ReserveDay;
  selectedSlot?: ReserveSlot;
  selectedPlan?: ReservePlan;
  getPlanPrice: (plan: ReservePlan) => number;
};
