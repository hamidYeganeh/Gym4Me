import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";

export type OwnerHomeTasksOverviewCard = {
  id: string;
  title: string;
  value: string;
  description: string;
  actionLabel: string;
  onAction?: ButtonProps["onPress"];
};

export type OwnerHomeTasksOverviewSectionProps = {
  title: string;
  summary: ReactNode;
  seeAllLabel: string;
  primary: OwnerHomeTasksOverviewCard;
  upcoming: OwnerHomeTasksOverviewCard;
  assigned: OwnerHomeTasksOverviewCard;
  onSeeAll?: ButtonProps["onPress"];
};
