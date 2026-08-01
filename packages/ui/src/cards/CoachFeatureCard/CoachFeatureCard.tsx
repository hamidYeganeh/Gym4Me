"use client";

import { Chip, CloseButton, Typography } from "@heroui/react";
import { Calendar1 } from "@repo/icons/Calendar1";
import { SealCheck } from "@repo/icons/SealCheck";
import { StarFull } from "@repo/icons/StarFull";
import { MediaImage } from "../../common/MediaImage";
import { coachFeatureCardVariants } from "./CoachFeatureCard.styles";
import type { CoachFeatureCardProps } from "./CoachFeatureCard.types";

const DEFAULT_MAX_RATING = 5;

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function clampRating(rating: number, max: number) {
  if (!Number.isFinite(rating)) return 0;
  return Math.min(Math.max(rating, 0), max);
}

function StarRow({
  rating,
  maxRating,
  starsClassName,
  starClassName,
  starEmptyClassName,
}: {
  rating: number;
  maxRating: number;
  starsClassName: string;
  starClassName: string;
  starEmptyClassName: string;
}) {
  const filled = Math.round(clampRating(rating, maxRating));

  return (
    <div
      aria-label={`${formatRating(rating)} / ${maxRating}`}
      className={starsClassName}
      role="img"
    >
      {Array.from({ length: maxRating }, (_, index) => (
        <StarFull
          key={index}
          className={index < filled ? starClassName : starEmptyClassName}
          size={14}
        />
      ))}
    </div>
  );
}

export function CoachFeatureCard({
  image,
  imageAlt = "",
  title,
  specialty,
  rating,
  maxRating = DEFAULT_MAX_RATING,
  ratingCount,
  isNew = false,
  newLabel = "New",
  closeLabel = "Close",
  onClose,
  certifiedLabel,
  experienceLabel,
  imageClassName,
  className,
  ...props
}: CoachFeatureCardProps) {
  const slots = coachFeatureCardVariants();
  const showRating = rating != null;

  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.media()}>
        <MediaImage
          alt={imageAlt}
          className={slots.image({ className: imageClassName })}
          image={image}
          sizes="280px"
        />
        <div aria-hidden className={slots.mediaScrim()} />
      </div>

      <div className={slots.topBar()}>
        {isNew ? (
          <Chip className={slots.newBadge()} size="sm">
            <Chip.Label>{newLabel}</Chip.Label>
          </Chip>
        ) : (
          <span />
        )}
        <CloseButton
          aria-label={closeLabel}
          className={slots.closeButton()}
          onPress={onClose}
        />
      </div>

      <div className={slots.body()}>
        <Typography className={slots.title()} type="h4" weight="bold">
          {title}
        </Typography>
        {specialty != null && specialty !== "" ? (
          <Typography className={slots.specialty()} type="body-sm">
            {specialty}
          </Typography>
        ) : null}

        {showRating ? (
          <div className={slots.ratingRow()}>
            <StarRow
              maxRating={maxRating}
              rating={rating}
              starClassName={slots.star()}
              starEmptyClassName={slots.starEmpty()}
              starsClassName={slots.stars()}
            />
            <Typography className={slots.ratingText()} type="body-sm">
              {formatRating(rating)}
              {ratingCount != null ? (
                <span className={slots.ratingCount()}> ({ratingCount})</span>
              ) : null}
            </Typography>
          </div>
        ) : null}

        {(certifiedLabel != null || experienceLabel != null) && (
          <div className={slots.meta()}>
            {certifiedLabel != null ? (
              <span className={slots.metaItem()}>
                <SealCheck
                  aria-hidden
                  className={slots.metaIconSuccess()}
                  size={14}
                />
                {certifiedLabel}
              </span>
            ) : null}
            {experienceLabel != null ? (
              <span className={slots.metaItem()}>
                <Calendar1
                  aria-hidden
                  className={slots.metaIconMuted()}
                  size={14}
                />
                {experienceLabel}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
