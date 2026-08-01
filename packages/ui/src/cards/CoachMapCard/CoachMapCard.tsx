"use client";

import { Button, Card, Link, Typography } from "@heroui/react";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { Heart } from "@repo/icons/Heart";
import { MapPin1 } from "@repo/icons/MapPin1";
import { StarFull } from "@repo/icons/StarFull";
import { MediaImage } from "../../common/MediaImage";
import { coachMapCardVariants } from "./CoachMapCard.styles";
import type { CoachMapCardProps } from "./CoachMapCard.types";

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function formatRatingCount(count: number) {
  return count.toLocaleString("en-US");
}

export function CoachMapCard({
  image,
  imageAlt = "",
  title,
  specialtyLabel,
  specialtyIcon,
  rating,
  ratingCount,
  address,
  getDirectionsLabel,
  onGetDirections,
  viewDetailsLabel,
  onViewDetails,
  className,
}: CoachMapCardProps) {
  const slots = coachMapCardVariants();
  const showMeta = specialtyLabel != null || rating != null;

  return (
    <Card className={slots.root({ className })} variant="default">
      <div className={slots.row()}>
        <span className={slots.avatarWrap()}>
          <MediaImage
            alt={imageAlt}
            className={slots.avatar()}
            image={image}
            sizes="56px"
          />
        </span>

        <div className={slots.content()}>
          <Typography className={slots.title()} type="body" weight="bold">
            {title}
          </Typography>

          {showMeta ? (
            <div className={slots.meta()}>
              {specialtyLabel != null ? (
                <span className={slots.specialty()}>
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

              {specialtyLabel != null && rating != null ? (
                <span aria-hidden className={slots.metaDot()} />
              ) : null}

              {rating != null ? (
                <span className={slots.rating()}>
                  <StarFull aria-hidden className={slots.star()} size={14} />
                  <Typography className={slots.ratingText()} type="body-sm">
                    {formatRating(rating)}
                    {ratingCount != null
                      ? ` (${formatRatingCount(ratingCount)})`
                      : null}
                  </Typography>
                </span>
              ) : null}
            </div>
          ) : null}

          {address != null ? (
            <Typography className={slots.address()} type="body-sm">
              {address}
            </Typography>
          ) : null}

          {getDirectionsLabel != null ? (
            <Link className={slots.directions()} onPress={onGetDirections}>
              {getDirectionsLabel}
              <MapPin1
                aria-hidden
                className={slots.directionsIcon()}
                size={14}
              />
            </Link>
          ) : null}
        </div>
      </div>

      {viewDetailsLabel != null ? (
        <Button
          className={slots.action()}
          onPress={onViewDetails}
          size="lg"
          variant="primary"
        >
          {viewDetailsLabel}
          <ArrowRight aria-hidden className={slots.actionIcon()} size={16} />
        </Button>
      ) : null}
    </Card>
  );
}
