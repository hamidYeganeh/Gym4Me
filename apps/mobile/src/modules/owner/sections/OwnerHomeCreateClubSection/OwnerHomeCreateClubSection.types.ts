import type { ButtonProps } from "@heroui/react";

export type OwnerHomeCreateClubSectionProps = {
  title: string;
  subtitle: string;
  meta?: string;
  badge?: string;
  actionLabel: string;
  onAction?: ButtonProps["onPress"];
};
