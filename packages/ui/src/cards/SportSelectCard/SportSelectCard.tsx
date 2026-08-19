"use client";

import { ToggleButton } from "@heroui/react/toggle-button";
import { Typography } from "@heroui/react/typography";
import { sportSelectCardVariants } from "./SportSelectCard.styles";
import type { SportSelectCardProps } from "./SportSelectCard.types";

export function SportSelectCard({
  label,
  icon,
  actionLabel,
  isSelected = false,
  className,
  ...props
}: SportSelectCardProps) {
  const slots = sportSelectCardVariants({ selected: isSelected });

  return (
    <ToggleButton
      {...props}
      aria-label={actionLabel}
      className={slots.root({ className })}
      isSelected={isSelected}
      variant="ghost"
    >
      <span aria-hidden className={slots.icon()}>
        {icon}
      </span>
      <Typography className={slots.label()} weight="bold">
        {label}
      </Typography>
    </ToggleButton>
  );
}
