import type { IconProps } from "@repo/icons";
import type { ComponentType } from "react";

export type WelcomeMetricTone = "weight" | "pressure" | "heart";

export type WelcomeMetricTrailing = "chevron" | "warning";

export type WelcomeMetricCardProps = {
  className?: string;
  title: string;
  periodLabel: string;
  value: string;
  unit: string;
  status: string;
  tone: WelcomeMetricTone;
  icon: ComponentType<IconProps>;
  trailing?: WelcomeMetricTrailing;
  /** Restart chart draw when this changes. */
  animationKey?: string | number;
};
