"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Calendar1 } from "@repo/icons/Calendar1";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { SealCheck } from "@repo/icons/SealCheck";
import { StarFull } from "@repo/icons/StarFull";
import { reservationCardVariants } from "./ReservationCard.styles";
import type { ReservationCardProps } from "./ReservationCard.types";

const ICON_SIZE = 20;

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

export function ReservationCard({
  datetimeLabel,
  coachName,
  isVerified = false,
  verifiedLabel = "Verified",
  specialtyLabel,
  specialtyIcon,
  rating,
  ratingCount,
  sessionTitle,
  statusLabel,
  statusColor = "default",
  onPress,
  "aria-label": ariaLabel,
  onReschedule,
  onCancel,
  rescheduleLabel = "Reschedule",
  cancelLabel = "Cancel",
  className,
}: ReservationCardProps) {
  const slots = reservationCardVariants();
  const hasSpecialty = specialtyLabel != null && specialtyLabel !== "";
  const hasRating = typeof rating === "number" && Number.isFinite(rating);
  const hasMeta = hasSpecialty || hasRating;
  const hasActions = onReschedule != null || onCancel != null;

  return (
    <article className={slots.root({ className })}>
      <Button
        aria-label={
          ariaLabel ??
          (typeof coachName === "string" ? coachName : undefined)
        }
        className={slots.card()}
        onPress={onPress}
        variant="ghost"
      >
        <span aria-hidden className={slots.iconWrap()}>
          <Calendar1 size={ICON_SIZE} />
        </span>

        <span className={slots.content()}>
          <span className={slots.topRow()}>
            <span className={slots.nameRow()}>
              {isVerified ? (
                <SealCheck
                  aria-label={verifiedLabel}
                  className={slots.verified()}
                  size={20}
                />
              ) : null}
              <Typography className={slots.name()} type="body" weight="bold">
                {coachName}
              </Typography>
            </span>
            <Typography className={slots.datetime()} type="body-xs">
              {datetimeLabel}
            </Typography>
          </span>

          {hasMeta ? (
            <span className={slots.metaRow()}>
              {hasSpecialty ? (
                <span className={slots.specialty()}>
                  {specialtyIcon ?? (
                    <HeartEcg
                      aria-hidden
                      className={slots.specialtyIcon()}
                      size={14}
                    />
                  )}
                  {specialtyLabel}
                </span>
              ) : null}
              {hasSpecialty && hasRating ? (
                <span aria-hidden className={slots.metaDot()}>
                  •
                </span>
              ) : null}
              {hasRating ? (
                <span className={slots.rating()}>
                  <StarFull aria-hidden className={slots.star()} size={14} />
                  <Typography className={slots.ratingValue()} type="body-sm">
                    {formatRating(rating)}
                    {ratingCount != null ? (
                      <span className={slots.ratingCount()}>
                        {" "}
                        ({ratingCount})
                      </span>
                    ) : null}
                  </Typography>
                </span>
              ) : null}
            </span>
          ) : null}

          <Typography className={slots.sessionTitle()} type="body-sm">
            {sessionTitle}
          </Typography>

          {statusLabel != null && statusLabel !== "" ? (
            <span className={slots.statusRow()}>
              <Chip color={statusColor} size="sm" variant="soft">
                <Chip.Label>{statusLabel}</Chip.Label>
              </Chip>
            </span>
          ) : null}
        </span>

        <ChevronRight aria-hidden className={slots.chevron()} size={16} />
      </Button>

      {hasActions ? (
        <div className={slots.actions()}>
          {onReschedule != null ? (
            <Button
              className={slots.reschedule()}
              onPress={onReschedule}
              variant="secondary"
            >
              {rescheduleLabel}
            </Button>
          ) : null}
          {onCancel != null ? (
            <Button
              className={slots.cancel()}
              onPress={onCancel}
              variant="secondary"
            >
              {cancelLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
