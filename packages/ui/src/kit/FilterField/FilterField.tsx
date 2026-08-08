"use client";

import { Button } from "@heroui/react";
import { ChevronDown } from "@repo/icons/ChevronDown";
import { Pencil1 } from "@repo/icons/Pencil1";
import { filterFieldVariants } from "./FilterField.styles";
import type { FilterFieldProps } from "./FilterField.types";

function TrailingIcon({
  trailing,
  trailingIcon,
}: Pick<FilterFieldProps, "trailing" | "trailingIcon">) {
  if (trailingIcon) return trailingIcon;
  if (trailing === "none") return null;
  if (trailing === "edit") return <Pencil1 size={20} />;
  return <ChevronDown size={20} />;
}

export function FilterField({
  label,
  value,
  icon,
  trailing = "chevron",
  trailingIcon,
  className,
  triggerClassName,
  labelClassName,
  ...props
}: FilterFieldProps) {
  const slots = filterFieldVariants();

  return (
    <div className={slots.root({ className })}>
      {label ? (
        <span className={slots.label({ className: labelClassName })}>{label}</span>
      ) : null}
      <Button
        {...props}
        className={slots.trigger({ className: triggerClassName })}
        fullWidth
        size="lg"
        variant="ghost"
      >
        {icon ? <span className={slots.icon()}>{icon}</span> : null}
        <span className={slots.value()}>{value}</span>
        <span className={slots.trailing()}>
          <TrailingIcon trailing={trailing} trailingIcon={trailingIcon} />
        </span>
      </Button>
    </div>
  );
}
