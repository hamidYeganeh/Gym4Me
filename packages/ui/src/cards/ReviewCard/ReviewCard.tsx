"use client";

import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Typography } from "@heroui/react/typography";
import { SealCheck } from "@repo/icons/SealCheck";
import { StarFull } from "@repo/icons/StarFull";
import { StarHalf } from "@repo/icons/StarHalf";
import { ThumbsDown } from "@repo/icons/ThumbsDown";
import { ThumbsUp } from "@repo/icons/ThumbsUp";
import { PLACEHOLDER_IMAGE } from "../../common/placeholder";
import { reviewCardVariants } from "./ReviewCard.styles";
import type { ReviewCardProps } from "./ReviewCard.types";

const DEFAULT_MAX_RATING = 5;
const STAR_SIZE = 18;

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
  const value = clampRating(rating, maxRating);

  return (
    <div
      aria-label={`${formatRating(rating)} / ${maxRating}`}
      className={starsClassName}
      role="img"
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const threshold = index + 1;
        if (value >= threshold) {
          return (
            <StarFull
              key={index}
              className={starClassName}
              size={STAR_SIZE}
            />
          );
        }
        if (value >= threshold - 0.5) {
          return (
            <StarHalf
              key={index}
              className={starClassName}
              size={STAR_SIZE}
            />
          );
        }
        return (
          <StarFull
            key={index}
            className={starEmptyClassName}
            size={STAR_SIZE}
          />
        );
      })}
    </div>
  );
}

function resolveAvatar(avatar: ReviewCardProps["avatar"]) {
  if (typeof avatar !== "string") return PLACEHOLDER_IMAGE;
  const trimmed = avatar.trim();
  return trimmed.length > 0 ? trimmed : PLACEHOLDER_IMAGE;
}

export function ReviewCard({
  avatar,
  avatarAlt = "",
  avatarFallback,
  date,
  title,
  content,
  rating,
  maxRating = DEFAULT_MAX_RATING,
  isVerified = true,
  verifiedLabel = "Verified Review",
  likeLabel = "Like",
  dislikeLabel = "Dislike",
  reportLabel = "Report",
  onLike,
  onDislike,
  onReport,
  className,
  ...props
}: ReviewCardProps) {
  const slots = reviewCardVariants();
  const src = resolveAvatar(avatar);
  const fallback =
    avatarFallback ??
    (typeof title === "string" ? title.slice(0, 2) : "?");

  return (
    <Card className={slots.root({ className })} variant="transparent" {...props}>
      <Card.Header className={slots.header()}>
        <Avatar className={slots.avatar()} size="md">
          <Avatar.Image alt={avatarAlt} src={src} />
          <Avatar.Fallback>{fallback}</Avatar.Fallback>
        </Avatar>
        <div className={slots.meta()}>
          {date != null && date !== "" ? (
            <Typography className={slots.date()} type="body-sm">
              {date}
            </Typography>
          ) : null}
          <Typography className={slots.title()} type="body" weight="bold">
            {title}
          </Typography>
        </div>
      </Card.Header>

      <Card.Content className={slots.content()}>
        <Typography className={slots.body()} type="body">
          {content}
        </Typography>
      </Card.Content>

      <div className={slots.ratingBlock()}>
        <div className={slots.ratingRow()}>
          <StarRow
            maxRating={maxRating}
            rating={rating}
            starClassName={slots.star()}
            starEmptyClassName={slots.starEmpty()}
            starsClassName={slots.stars()}
          />
          <Typography className={slots.ratingValue()} type="body" weight="bold">
            {formatRating(rating)}
          </Typography>
        </div>

        {isVerified ? (
          <div className={slots.verified()}>
            <SealCheck aria-hidden className={slots.verifiedIcon()} size={20} />
            <Typography className={slots.verifiedLabel()} type="body-sm">
              {verifiedLabel}
            </Typography>
          </div>
        ) : null}
      </div>

      <Card.Footer className={slots.footer()}>
        <Button className={slots.action()} onPress={onLike} variant="ghost">
          <ThumbsUp aria-hidden className={slots.actionIcon()} size={16} />
          {likeLabel}
        </Button>
        <Button className={slots.action()} onPress={onDislike} variant="ghost">
          <ThumbsDown aria-hidden className={slots.actionIcon()} size={16} />
          {dislikeLabel}
        </Button>
        <Button className={slots.report()} onPress={onReport} variant="ghost">
          {reportLabel}
        </Button>
      </Card.Footer>
    </Card>
  );
}
