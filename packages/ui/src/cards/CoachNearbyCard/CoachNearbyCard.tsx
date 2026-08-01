"use client";

import { Button, Typography } from "@heroui/react";
import { CheckCircle } from "@repo/icons/CheckCircle";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { CloseXCircle } from "@repo/icons/CloseXCircle";
import { MapPin1 } from "@repo/icons/MapPin1";
import { StarFull } from "@repo/icons/StarFull";
import { MediaImage } from "../../common/MediaImage";
import { coachNearbyCardVariants } from "./CoachNearbyCard.styles";
import type { CoachNearbyCardProps } from "./CoachNearbyCard.types";

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

export function CoachNearbyCard({
  image,
  imageAlt = "",
  title,
  priceLabel,
  specialtyLabel,
  specialtyIcon,
  distanceLabel,
  rating,
  maxRating = DEFAULT_MAX_RATING,
  ratingCount,
  availability = "remote",
  remoteLabel = "Available Remotely",
  inPersonLabel = "In-Person Only",
  onPress,
  className,
  ...props
}: CoachNearbyCardProps) {
  const slots = coachNearbyCardVariants();
  const isRemote = availability === "remote";

  return (
    <Button
      {...props}
      className={slots.root({ className })}
      onPress={onPress}
      variant="ghost"
    >
      <span className={slots.avatarWrap()}>
        <MediaImage
          alt={imageAlt}
          className={slots.avatar()}
          image={image}
          sizes="56px"
        />
      </span>

      <span className={slots.content()}>
        <Typography className={slots.title()} type="body" weight="bold">
          {title}
        </Typography>
        {priceLabel != null ? (
          <Typography className={slots.price()} type="body-sm">
            {priceLabel}
          </Typography>
        ) : null}

        {(specialtyLabel != null || distanceLabel != null) && (
          <span className={slots.tags()}>
            {specialtyLabel != null ? (
              <span className={slots.tag()}>
                {specialtyIcon ?? (
                  <span aria-hidden className={slots.tagIcon()} />
                )}
                {specialtyLabel}
              </span>
            ) : null}
            {distanceLabel != null ? (
              <span className={slots.tag()}>
                <MapPin1 aria-hidden className={slots.tagIcon()} size={14} />
                {distanceLabel}
              </span>
            ) : null}
          </span>
        )}

        {rating != null ? (
          <span className={slots.ratingRow()}>
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
          </span>
        ) : null}

        <span
          className={[
            slots.availability(),
            isRemote
              ? slots.availabilityRemote()
              : slots.availabilityInPerson(),
          ].join(" ")}
        >
          {isRemote ? (
            <CheckCircle
              aria-hidden
              className={slots.availabilityIcon()}
              size={14}
            />
          ) : (
            <CloseXCircle
              aria-hidden
              className={slots.availabilityIcon()}
              size={14}
            />
          )}
          {isRemote ? remoteLabel : inPersonLabel}
        </span>
      </span>

      <ChevronRight aria-hidden className={slots.chevron()} size={16} />
    </Button>
  );
}
