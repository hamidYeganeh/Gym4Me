import type {
  ReserveDay,
  ReservePlan,
  ReserveSlot,
} from "../../lib/reserve-data";

export type DiscoveryClubsReserveScreenProps = {
  clubTitle: string;
  clubLocation?: string;
  clubImage: string;
  days: ReserveDay[];
  slotsByDay: Record<string, ReserveSlot[]>;
  plans: ReservePlan[];
};
