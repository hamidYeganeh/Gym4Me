"use client";

import { Button, Typography } from "@heroui/react";
import { quickActionCardVariants } from "./QuickActionCard.styles";
import type { QuickActionCardProps } from "./QuickActionCard.types";

export function QuickActionCard({
  icon,
  label,
  actionLabel,
  className,
  tileClassName,
  labelClassName,
  ...props
}: QuickActionCardProps) {
  const slots = quickActionCardVariants();
  const ariaLabel =
    actionLabel ?? (typeof label === "string" ? label : undefined);

  return (
    <Button
      {...props}
      aria-label={ariaLabel}
      className={slots.root({ className })}
      variant="ghost"
    >
      <span aria-hidden className={slots.tile({ className: tileClassName })}>
        <span className={slots.icon()}>{icon}</span>
      </span>
      <Typography
        align="center"
        className={slots.label({ className: labelClassName })}
        type="body-xs"
        weight="medium"
      >
        {label}
      </Typography>
    </Button>
  );
}
