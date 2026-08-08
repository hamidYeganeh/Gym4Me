"use client";

import { Button } from "@heroui/react";
import {
  filterChipBarVariants,
  filterChipVariants,
} from "./FilterChip.styles";
import type { FilterChipBarProps, FilterChipProps } from "./FilterChip.types";

export function FilterChip({
  children,
  icon,
  selected = false,
  selectedVariant = "outline",
  className,
  ...props
}: FilterChipProps) {
  const slots = filterChipVariants({ selected, selectedVariant });

  return (
    <Button
      {...props}
      className={slots.root({ className })}
      size="md"
      variant="ghost"
    >
      {icon ? <span className={slots.icon()}>{icon}</span> : null}
      <span className={slots.label()}>{children}</span>
    </Button>
  );
}

export function FilterChipBar({
  children,
  className,
  "aria-label": ariaLabel,
}: FilterChipBarProps) {
  const slots = filterChipBarVariants();

  return (
    <div aria-label={ariaLabel} className={slots.root({ className })} role="group">
      {children}
    </div>
  );
}
