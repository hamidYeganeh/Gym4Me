"use client";

import { Button, Typography } from "@heroui/react";
import { Dragger } from "@repo/icons/Dragger";
import { Minus } from "@repo/icons/Minus";
import { metricReorderItemVariants } from "./MetricReorderItem.styles";
import type { MetricReorderItemProps } from "./MetricReorderItem.types";

export function MetricReorderItem({
  title,
  icon,
  removeLabel,
  dragLabel,
  onRemove,
  dragHandleProps,
  removeClassName,
  dragClassName,
  className,
  ...props
}: MetricReorderItemProps) {
  const slots = metricReorderItemVariants();

  return (
    <div className={slots.root({ className })} {...props}>
      <Button
        aria-label={removeLabel}
        className={slots.remove({ className: removeClassName })}
        isIconOnly
        onPress={onRemove}
        size="lg"
        variant="danger"
      >
        <Minus aria-hidden size={14} />
      </Button>

      <div className={slots.meta()}>
        <span aria-hidden className={slots.icon()}>
          {icon}
        </span>
        <Typography className={slots.title()}>{title}</Typography>
      </div>

      {/* Native control: DnD listeners conflict with React Aria press handlers */}
      <button
        className={slots.drag({ className: dragClassName })}
        type="button"
        {...dragHandleProps}
        aria-label={dragLabel}
      >
        <Dragger aria-hidden size={20} />
      </button>
    </div>
  );
}
