"use client";

import { Button, Typography } from "@heroui/react";
import { Sparkle2 } from "@repo/icons/Sparkle2";
import { coachAiCardVariants } from "./CoachAiCard.styles";
import type { CoachAiCardProps } from "./CoachAiCard.types";

export function CoachAiCard({
  title,
  actionLabel,
  actionIcon,
  onAction,
  actionClassName,
  className,
  ...props
}: CoachAiCardProps) {
  const slots = coachAiCardVariants();

  return (
    <div className={slots.root({ className })} {...props}>
      <Typography className={slots.title()} weight="semibold">
        {title}
      </Typography>
      <Button
        className={slots.action({ className: actionClassName })}
        onPress={onAction}
        variant="ghost"
      >
        {actionIcon ?? (
          <Sparkle2 aria-hidden className={slots.actionIcon()} size={16} />
        )}
        <span>{actionLabel}</span>
      </Button>
    </div>
  );
}
