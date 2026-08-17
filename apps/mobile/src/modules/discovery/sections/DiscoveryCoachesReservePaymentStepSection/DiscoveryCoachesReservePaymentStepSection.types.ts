import type { CoachDetailConsultationType } from "../../lib/coach-detail-data";
import type { CoachSlotView } from "@/shared/hooks/useCoachSlotsWeek";

export type DiscoveryCoachesReservePaymentStepSectionProps = {
  coupon: string;
  onCouponChange: (value: string) => void;
  appliedCoupon: string | null;
  onApplyCoupon: () => void;
  selectedConsultation?: CoachDetailConsultationType;
  selectedSlot: CoachSlotView | null;
  price: number;
  error: string | null;
};
