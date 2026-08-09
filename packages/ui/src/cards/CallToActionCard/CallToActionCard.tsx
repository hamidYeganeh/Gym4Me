"use client";

import { Button, Chip, Typography } from "@heroui/react";
import { ChatLine } from "@repo/icons/ChatLine";
import { Plus } from "@repo/icons/Plus";
import { callToActionCardVariants } from "./CallToActionCard.styles";
import type { CallToActionCardProps } from "./CallToActionCard.types";

export function CallToActionCard({
  variant = "primary",
  actionType = "plus",
  subtitle,
  title,
  meta,
  badge,
  icon,
  actionLabel,
  onAction,
  actionClassName,
  className,
  ...props
}: CallToActionCardProps) {
  const isSoft = variant === "soft";
  const isLabeledButton = actionType === "button";
  const slots = callToActionCardVariants({ variant, actionType });
  const actionIcon =
    actionType === "icon" && !isSoft
      ? (icon ?? <ChatLine size={28} />)
      : <Plus size={isSoft ? 18 : 22} />;
  const hasBadge = badge != null && badge !== "";
  const hasMeta = meta != null && meta !== "";

  const actionButton = isLabeledButton ? (
    <Button
      aria-label={actionLabel}
      className={slots.action({ className: actionClassName })}
      onPress={onAction}
      size="lg"
      variant="secondary"
    >
      {actionLabel}
    </Button>
  ) : (
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
  );

  return (
    <div
      className={slots.root({ className })}
      data-action-type={actionType}
      data-variant={variant}
      {...props}
    >
      <div className={slots.content()}>
        {isSoft ? (
          <>
            <Typography className={slots.title()} type="body" weight="bold">
              {title}
            </Typography>
            <Typography className={slots.subtitle()} type="body" weight="semibold">
              {subtitle}
              {hasMeta ? (
                <span className={slots.meta()}>{meta}</span>
              ) : null}
            </Typography>
            {hasBadge ? (
              <Chip
                className={slots.badge()}
                color="accent"
                size="sm"
                variant="primary"
              >
                <Chip.Label>{badge}</Chip.Label>
              </Chip>
            ) : null}
          </>
        ) : (
          <>
            <Typography className={slots.subtitle()} type="body" weight="medium">
              {subtitle}
            </Typography>
            <Typography className={slots.title()} type="h3" weight="bold">
              {title}
            </Typography>
          </>
        )}
      </div>

      {isSoft && !isLabeledButton ? (
        <div className={slots.actionRing()}>{actionButton}</div>
      ) : (
        actionButton
      )}
    </div>
  );
}
