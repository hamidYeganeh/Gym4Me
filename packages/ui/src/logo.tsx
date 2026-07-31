"use client";

import { useId } from "react";
import {
  LogoMark,
  type LogoMarkProps,
  LOGO_COLOR,
  LOGO_SIZES,
  resolveLogoSize,
  type LogoSize,
  type LogoSizeToken,
} from "./logo-mark";

export type LogoProps = Omit<LogoMarkProps, "instanceId">;

export function Logo({ size = "lg", ...props }: LogoProps) {
  const instanceId = useId().replace(/:/g, "");

  return <LogoMark size={size} instanceId={instanceId} {...props} />;
}

export {
  LogoMark,
  LOGO_COLOR,
  LOGO_SIZES,
  resolveLogoSize,
  type LogoMarkProps,
  type LogoSize,
  type LogoSizeToken,
};
