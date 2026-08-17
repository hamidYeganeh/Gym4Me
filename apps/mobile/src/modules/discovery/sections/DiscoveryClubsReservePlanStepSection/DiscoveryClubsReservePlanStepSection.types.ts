import type { ReservePlan, ReserveSlot } from "../../lib/reserve-data";

export type DiscoveryClubsReservePlanStepSectionProps = {
  plans: ReservePlan[];
  selectedPlanId: string | null;
  onPlanPress: (planId: string) => void;
  getPlanPrice: (plan: ReservePlan) => number;
  selectedSlot?: ReserveSlot;
};
