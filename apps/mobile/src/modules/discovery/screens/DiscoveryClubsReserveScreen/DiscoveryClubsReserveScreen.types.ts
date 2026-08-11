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
  /**
   * API-backed flow: called on final confirm instead of the demo payment
   * redirect. Should reject with an Error whose message is user-displayable.
   */
  onConfirm?: (selection: {
    slot: ReserveSlot;
    plan: ReservePlan;
  }) => Promise<void>;
};
