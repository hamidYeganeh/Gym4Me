"use client";

import { Typography } from "@heroui/react";
import { Clock } from "@repo/icons/Clock";
import { readingTimeCardVariants } from "./ReadingTimeCard.styles";
import type { ReadingTimeCardProps } from "./ReadingTimeCard.types";

export function ReadingTimeCard({
  label,
  value,
  icon,
  className,
  ...props
}: ReadingTimeCardProps) {
  const slots = readingTimeCardVariants();

  return (
    <div className={slots.root({ className })} {...props}>
      <Typography className={slots.label()} type="body-sm" weight="medium">
        {label}
      </Typography>
      <Typography className={slots.value()} weight="bold">
        {value}
      </Typography>
      <span aria-hidden className={slots.icon()}>
        {icon ?? <Clock size={20} />}
      </span>
    </div>
  );
}
