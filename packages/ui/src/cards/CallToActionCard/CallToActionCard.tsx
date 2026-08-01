"use client";

import { Button, Typography } from "@heroui/react";
import { ChatLine } from "@repo/icons/ChatLine";
import { Plus } from "@repo/icons/Plus";
import { callToActionCardVariants } from "./CallToActionCard.styles";
import type { CallToActionCardProps } from "./CallToActionCard.types";

export function CallToActionCard({
  variant = "primary",
  actionType = "plus",
  subtitle,
  title,
  icon,
  actionLabel,
  onAction,
  actionClassName,
  className,
  ...props
}: CallToActionCardProps) {
  const slots = callToActionCardVariants({ variant, actionType });
  const actionIcon =
    actionType === "icon"
      ? (icon ?? <ChatLine size={28} />)
      : <Plus size={22} />;

  return (
    <div
      className={slots.root({ className })}
      data-action-type={actionType}
      data-variant={variant}
      {...props}
    >
      <div className={slots.content()}>
        <Typography className={slots.subtitle()} type="body" weight="medium">
          {subtitle}
        </Typography>
        <Typography className={slots.title()} type="h3" weight="bold">
          {title}
        </Typography>
      </div>

      <Button
        aria-label={actionLabel}
        className={slots.action({ className: actionClassName })}
        isIconOnly
        onPress={onAction}
        size="lg"
        variant="ghost"
      >
        {actionIcon}
      </Button>
    </div>
  );
}
