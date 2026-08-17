import type {
  CoachSlotDayView,
  CoachSlotView,
} from "@/shared/hooks/useCoachSlotsWeek";

export type DiscoveryCoachesSlotsScheduleSectionProps = {
  days: CoachSlotDayView[];
  weekLabel: string;
  today: string;
  selectedSlotId?: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSlotPress: (slot: CoachSlotView) => void;
  className?: string;
};

export type SelectedCoachSlot = {
  day: CoachSlotDayView;
  slot: CoachSlotView;
} | null;
