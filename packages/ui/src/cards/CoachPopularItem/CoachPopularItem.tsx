"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { StarFull } from "@repo/icons/StarFull";
import { MediaImage } from "../../common/MediaImage";
import { coachPopularItemVariants } from "./CoachPopularItem.styles";
import type { CoachPopularItemProps } from "./CoachPopularItem.types";

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

export function CoachPopularItem({
  rank,
  image,
  imageAlt = "",
  title,
  experienceLabel,
  rating,
  ratingCount,
  onPress,
  className,
  ...props
}: CoachPopularItemProps) {
  const slots = coachPopularItemVariants();

  return (
    <Button
      {...props}
      className={slots.root({ className })}
      onPress={onPress}
      variant="ghost"
    >
      <span className={slots.rank()}>{rank}</span>
      <span className={slots.avatarWrap()}>
        <MediaImage
          alt={imageAlt}
          className={slots.avatar()}
          image={image}
          sizes="44px"
        />
      </span>
      <span className={slots.content()}>
        <Typography className={slots.title()} type="body" weight="semibold">
          {title}
        </Typography>
        <span className={slots.meta()}>
          {experienceLabel != null ? <span>{experienceLabel}</span> : null}
          {rating != null ? (
            <span className={slots.rating()}>
              <StarFull aria-hidden className={slots.star()} size={14} />
              {formatRating(rating)}
              {ratingCount != null ? (
                <span className="text-muted"> ({ratingCount})</span>
              ) : null}
            </span>
          ) : null}
        </span>
      </span>
      <ChevronRight aria-hidden className={slots.chevron()} size={16} />
    </Button>
  );
}
