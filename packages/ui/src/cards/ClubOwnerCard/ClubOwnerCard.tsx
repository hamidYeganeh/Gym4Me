"use client";

import { Button, Typography } from "@heroui/react";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { Briefcase1 } from "@repo/icons/Briefcase1";
import { StarFull } from "@repo/icons/StarFull";
import { MediaImage } from "../../common/MediaImage";
import { clubOwnerCardVariants } from "./ClubOwnerCard.styles";
import type { ClubOwnerCardProps } from "./ClubOwnerCard.types";

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

export function ClubOwnerCard({
  image,
  imageAlt = "",
  title,
  rank,
  experienceLabel,
  rating,
  ratingCount,
  actionLabel,
  onPress,
  className,
  ...props
}: ClubOwnerCardProps) {
  const slots = clubOwnerCardVariants();
  const showMeta = experienceLabel != null || rating != null;

  return (
    <Button
      {...props}
      aria-label={actionLabel}
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
        {rank != null && rank !== "" ? (
          <span className={slots.rank()}>{rank}</span>
        ) : null}
      </span>

      <span className={slots.content()}>
        <Typography className={slots.title()} type="body" weight="bold">
          {title}
        </Typography>

        {showMeta ? (
          <span className={slots.meta()}>
            {experienceLabel != null ? (
              <span className={slots.experience()}>
                <Briefcase1
                  aria-hidden
                  className={slots.experienceIcon()}
                  size={14}
                />
                {experienceLabel}
              </span>
            ) : null}

            {experienceLabel != null && rating != null ? (
              <span aria-hidden className={slots.separator()}>
                •
              </span>
            ) : null}

            {rating != null ? (
              <span className={slots.rating()}>
                <StarFull aria-hidden className={slots.star()} size={14} />
                <span className={slots.ratingValue()}>
                  {formatRating(rating)}
                </span>
                {ratingCount != null ? (
                  <span className={slots.ratingCount()}>
                    ({ratingCount.toLocaleString("en-US")})
                  </span>
                ) : null}
              </span>
            ) : null}
          </span>
        ) : null}
      </span>

      <ArrowRight aria-hidden className={slots.chevron()} size={18} />
    </Button>
  );
}
