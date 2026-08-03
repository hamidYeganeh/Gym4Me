import type { ButtonProps } from "@heroui/react";

export type OwnerHomeQuickActionsSectionProps = {
  /** Accessible name for the quick-actions row. */
  sectionLabel?: string;
  aiLabel: string;
  photoLabel: string;
  videoLabel: string;
  moreLabel: string;
  onAiPress?: ButtonProps["onPress"];
  onPhotoPress?: ButtonProps["onPress"];
  onVideoPress?: ButtonProps["onPress"];
  onMorePress?: ButtonProps["onPress"];
};
