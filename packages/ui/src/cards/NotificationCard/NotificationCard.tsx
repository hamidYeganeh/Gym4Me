"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { ProgressBar } from "@heroui/react/progress-bar";
import { Typography } from "@heroui/react/typography";
import { Bell1 } from "@repo/icons/Bell1";
import { notificationCardVariants } from "./NotificationCard.styles";
import type {
  NotificationCardAction,
  NotificationCardProps,
} from "./NotificationCard.types";

function resolveActionLabel(action: NotificationCardAction) {
  if (action.actionLabel) return action.actionLabel;
  return typeof action.label === "string" ? action.label : undefined;
}

export function NotificationCard({
  title,
  description,
  timestamp,
  icon,
  badge,
  badgeIcon,
  progress,
  progressLabel,
  primaryAction,
  secondaryAction,
  children,
  className,
  ...props
}: NotificationCardProps) {
  const hasBadge = badge != null && badge !== "";
  const hasDescription = description != null && description !== "";
  const hasTimestamp = timestamp != null && timestamp !== "";
  const hasProgress = typeof progress === "number" && Number.isFinite(progress);
  const hasActions = primaryAction != null || secondaryAction != null;
  const hasMedia = children != null;
  const clamped = hasProgress
    ? Math.min(100, Math.max(0, progress))
    : 0;
  const align =
    hasMedia || hasActions || hasBadge || hasProgress ? "start" : "center";
  const slots = notificationCardVariants({ align });

  return (
    <div className={slots.root({ className })} {...props}>
      <span aria-hidden className={slots.iconWrap()}>
        {icon ?? <Bell1 size={20} />}
      </span>

      <div className={slots.body()}>
        <div className={slots.header()}>
          <Typography className={slots.title()} type="body" weight="bold">
            {title}
          </Typography>
          {hasTimestamp ? (
            <Typography className={slots.timestamp()} type="body-sm">
              {timestamp}
            </Typography>
          ) : null}
        </div>

        {hasProgress ? (
          <ProgressBar
            aria-label={
              progressLabel ??
              (typeof title === "string" ? title : "Progress")
            }
            className={slots.progress()}
            value={clamped}
          >
            <ProgressBar.Track className={slots.track()}>
              <ProgressBar.Fill className={slots.fill()} />
            </ProgressBar.Track>
          </ProgressBar>
        ) : null}

        {hasDescription ? (
          <Typography className={slots.description()} type="body-sm">
            {description}
          </Typography>
        ) : null}

        {hasBadge ? (
          <Chip className={slots.badge()} size="sm" variant="secondary">
            <span aria-hidden className={slots.badgeIcon()}>
              {badgeIcon ?? <span className={slots.badgeDot()} />}
            </span>
            <Chip.Label>{badge}</Chip.Label>
          </Chip>
        ) : null}

        {hasActions ? (
          <div className={slots.actions()}>
            {primaryAction ? (
              <Button
                aria-label={resolveActionLabel(primaryAction)}
                className={slots.primaryAction()}
                onPress={primaryAction.onPress}
                variant="ghost"
              >
                {primaryAction.label}
              </Button>
            ) : null}
            {secondaryAction ? (
              <Button
                aria-label={resolveActionLabel(secondaryAction)}
                className={slots.secondaryAction()}
                onPress={secondaryAction.onPress}
                variant="ghost"
              >
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        ) : null}

        {hasMedia ? <div className={slots.media()}>{children}</div> : null}
      </div>
    </div>
  );
}
