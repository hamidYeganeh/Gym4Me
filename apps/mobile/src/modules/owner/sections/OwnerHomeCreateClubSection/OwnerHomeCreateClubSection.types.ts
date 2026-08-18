import type { ButtonProps } from "@heroui/react/button";

export type OwnerHomeCreateClubSectionProps = {
  title: string;
  subtitle: string;
  meta?: string;
  badge?: string;
  actionLabel: string;
  onAction?: ButtonProps["onPress"];
};
