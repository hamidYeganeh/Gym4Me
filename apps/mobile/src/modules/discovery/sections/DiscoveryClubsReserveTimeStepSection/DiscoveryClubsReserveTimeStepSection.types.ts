import type { ReserveDay, ReserveSlot } from "../../lib/reserve-data";

export type DiscoveryClubsReserveTimeStepSectionProps = {
  days: ReserveDay[];
  activeDayId: string;
  activeDay?: ReserveDay;
  onDayPress: (dayId: string) => void;
  slots: ReserveSlot[];
  selectedSlotId: string | null;
  onSlotPress: (slotId: string) => void;
  onWaitlistPress?: (slot: ReserveSlot) => void;
  waitlistPendingId?: string | null;
  waitlistResult?: { slotId: string; error: boolean } | null;
};
