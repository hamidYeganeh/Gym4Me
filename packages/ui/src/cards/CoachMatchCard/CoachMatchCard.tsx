"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Whistle } from "@repo/icons/Whistle";
import { coachMatchCardVariants } from "./CoachMatchCard.styles";
import type { CoachMatchCardProps } from "./CoachMatchCard.types";

export function CoachMatchCard({
  title,
  actionLabel,
  actionIcon,
  onAction,
  actionClassName,
  className,
  ...props
}: CoachMatchCardProps) {
  const slots = coachMatchCardVariants();

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
          <Whistle aria-hidden className={slots.actionIcon()} size={16} />
        )}
        <span>{actionLabel}</span>
      </Button>
    </div>
  );
}
