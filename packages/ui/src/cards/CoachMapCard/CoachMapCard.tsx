"use client";

import { Button, Card, Typography } from "@heroui/react";
import { Check } from "@repo/icons/Check";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { Heart } from "@repo/icons/Heart";
import { MapPin1 } from "@repo/icons/MapPin1";
import { StarFull } from "@repo/icons/StarFull";
import { MediaImage } from "../../common/MediaImage";
import { coachMapCardVariants } from "./CoachMapCard.styles";
import type { CoachMapCardProps } from "./CoachMapCard.types";

const DEFAULT_MAX_RATING = 5;

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function formatRatingCount(count: number) {
  return count.toLocaleString("en-US");
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

export function CoachMapCard({
  image,
  imageAlt = "",
  title,
  specialtyLabel,
  specialtyIcon,
  distanceLabel,
  rating,
  maxRating = DEFAULT_MAX_RATING,
  ratingCount,
  address,
  verified = false,
  verifiedLabel = "Verified",
  getDirectionsLabel,
  onGetDirections,
  viewDetailsLabel,
  onViewDetails,
  className,
}: CoachMapCardProps) {
  const slots = coachMapCardVariants();
  const showMeta = specialtyLabel != null || distanceLabel != null;
  const showActions = getDirectionsLabel != null || viewDetailsLabel != null;

  return (
    <Card className={slots.root({ className })} variant="default">
      <div className={slots.row()}>
        <span className={slots.avatarWrap()}>
          <span className={slots.avatarFrame()}>
            <MediaImage
              alt={imageAlt}
              className={slots.avatar()}
              image={image}
              sizes="56px"
            />
          </span>
          {verified ? (
            <span
              aria-label={verifiedLabel}
              className={slots.verified()}
              role="img"
            >
              <Check
                aria-hidden
                className={slots.verifiedIcon()}
                size={12}
              />
            </span>
          ) : null}
        </span>

        <div className={slots.content()}>
          <Typography className={slots.title()} type="body" weight="bold">
            {title}
          </Typography>

          {address != null ? (
            <Typography className={slots.address()} type="body-sm">
              {address}
            </Typography>
          ) : null}

          {showMeta ? (
            <div className={slots.meta()}>
              {specialtyLabel != null ? (
                <span className={slots.metaItem()}>
                  {specialtyIcon ?? (
                    <Heart
                      aria-hidden
                      className={slots.specialtyIcon()}
                      size={14}
                    />
                  )}
                  {specialtyLabel}
                </span>
              ) : null}

              {distanceLabel != null ? (
                <span className={slots.metaItem()}>
                  <MapPin1
                    aria-hidden
                    className={slots.metaIcon()}
                    size={14}
                  />
                  {distanceLabel}
                </span>
              ) : null}
            </div>
          ) : null}

          {rating != null ? (
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
                  <span className={slots.ratingCount()}>
                    {" "}
                    ({formatRatingCount(ratingCount)})
                  </span>
                ) : null}
              </Typography>
            </div>
          ) : null}
        </div>

        {onViewDetails != null ? (
          <ChevronRight aria-hidden className={slots.chevron()} size={16} />
        ) : null}
      </div>

      {showActions ? (
        <div className={slots.actions()}>
          {getDirectionsLabel != null ? (
            <Button
              className={slots.directions()}
              onPress={onGetDirections}
              size="lg"
              variant="outline"
            >
              {getDirectionsLabel}
            </Button>
          ) : null}
          {viewDetailsLabel != null ? (
            <Button
              className={slots.action()}
              onPress={onViewDetails}
              size="lg"
              variant="primary"
            >
              {viewDetailsLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
