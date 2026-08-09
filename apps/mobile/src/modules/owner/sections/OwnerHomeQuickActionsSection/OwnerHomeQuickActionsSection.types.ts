import type { ButtonProps } from "@heroui/react";

export type OwnerHomeQuickActionsSectionProps = {
  /** Accessible name for the quick-actions row. */
  sectionLabel?: string;
  classesLabel: string;
  bookingsLabel: string;
  equipmentLabel: string;
  moreLabel: string;
  onClassesPress?: ButtonProps["onPress"];
  onBookingsPress?: ButtonProps["onPress"];
  onEquipmentPress?: ButtonProps["onPress"];
  onMorePress?: ButtonProps["onPress"];
};
