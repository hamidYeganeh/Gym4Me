import type { CoachDetailConsultationType } from "../../lib/coach-detail-data";
import type { DiscoveryCoachSlotsWeek } from "../../lib/use-discovery-coach-slots";
import type { CoachSlotView } from "@/shared/hooks/useCoachSlotsWeek";

export type DiscoveryCoachesReserveTimeStepSectionProps = {
  consultationOptions: CoachDetailConsultationType[];
  selectedConsultation?: CoachDetailConsultationType;
  onConsultationPress: (optionId: string) => void;
  range: { from: string; to: string };
  onPrevWeek: () => void;
  onNextWeek: () => void;
  week: DiscoveryCoachSlotsWeek;
  availabilityDays: {
    id: string;
    label: string;
    slots: {
      id: string;
      timeLabel: string;
      status: "available" | "unavailable";
    }[];
  }[];
  selectedSlotId?: string;
  onSlotPress: (slotId: string) => void;
  selectedSlot: CoachSlotView | null;
};
