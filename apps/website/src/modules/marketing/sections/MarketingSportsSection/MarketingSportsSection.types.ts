import type { ComponentType, HTMLAttributes } from "react";

export type MarketingSportsIcon = {
  id: number;
  icon: ComponentType<{ size?: number }>;
  className: string;
  tone?: "glass" | "solid";
};

export type MarketingSportsSectionProps = HTMLAttributes<HTMLElement>;
