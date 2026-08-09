import type { IconProps } from "@repo/icons";
import type { ComponentType } from "react";

export type WelcomeActivityTone = "light" | "calm" | "intense";

export type WelcomeActivityCardProps = {
  className?: string;
  title: string;
  toneLabel: string;
  tone: WelcomeActivityTone;
  icon: ComponentType<IconProps>;
};
