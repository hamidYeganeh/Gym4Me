import type { CoachSlot } from "@repo/api";

export type CoachSlotsManageDayGroup = {
  date: string;
  label: string;
  slots: CoachSlot[];
};

export type CoachSlotsManageDaysSectionProps = {
  days: CoachSlotsManageDayGroup[];
  loading?: boolean;
  emptyDayLabel: string;
  removeSlotLabel: string;
  formatSlotTime: (startsAt: string) => string;
  onRemoveSlot: (slotId: string) => void | Promise<void>;
  className?: string;
};
