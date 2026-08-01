"use client";

import { useId } from "react";
import { LogoMark } from "../LogoMark";
import { logoVariants } from "./Logo.styles";
import type { LogoProps } from "./Logo.types";

export function Logo({ size = "lg", className, ...props }: LogoProps) {
  const instanceId = useId().replace(/:/g, "");
  const slots = logoVariants();

  return (
    <LogoMark
      size={size}
      instanceId={instanceId}
      className={slots.root({ className })}
      {...props}
    />
  );
}
