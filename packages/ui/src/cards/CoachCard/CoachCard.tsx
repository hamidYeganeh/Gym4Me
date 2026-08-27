"use client";

import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ShapeCircle } from "@repo/icons/ShapeCircle";
import { StarSolid } from "@repo/icons/StarSolid";
import type { KeyboardEvent } from "react";
import { MediaImage } from "../../common/MediaImage";
import { brandAwareText } from "../../kit/LineShadowText";
import { coachCardVariants } from "./CoachCard.styles";
import type { CoachCardProps } from "./CoachCard.types";

const DEFAULT_MAX_RATING = 5;
const STAR_SIZE = 16;

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
  starWrapClassName,
  starFillClassName,
  starClassName,
  starEmptyClassName,
}: {
  rating: number;
  maxRating: number;
  starsClassName: string;
  starWrapClassName: string;
  starFillClassName: string;
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
        const fill = Math.min(1, Math.max(0, value - index));

        return (
          <span key={index} className={starWrapClassName}>
            <StarSolid className={starEmptyClassName} size={STAR_SIZE} />
            {fill > 0 ? (
              <span
                className={starFillClassName}
                style={{ width: `${fill * 100}%` }}
              >
                <StarSolid className={starClassName} size={STAR_SIZE} />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

export function CoachCard({
  variant = "default",
  image,
  imageAlt = "",
  badge,
  title,
  subtitle,
  meta,
  rating,
  maxRating = DEFAULT_MAX_RATING,
  ratingCount,
  stats,
  author,
  actionLabel = "Action",
  actionIcon,
  onAction,
  onPress,
  onClick,
  imageClassName,
  className,
  ...props
}: CoachCardProps) {
  const slots = coachCardVariants({ variant });
  const isPressable = onPress != null || onClick != null;
  const showBadge = badge != null && badge !== "";
  const showAction = onAction != null || actionIcon != null;
  const showTopBar = showBadge || showAction;
  const metaItems = (meta ?? []).filter((item) => item != null && item !== "");
  const showMeta = metaItems.length > 0;
  const showSubtitle = !showMeta && subtitle != null && subtitle !== "";
  const showRating = rating != null;
  const visibleStats = (stats ?? []).filter(
    (item) => item.label != null && item.label !== "",
  );
  const showStats = visibleStats.length > 0;
  const showAuthor = author != null;
  const titleType = variant === "compact" ? "h4" : "h3";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event);
    if (!isPressable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (onPress) {
        void onPress({} as never);
        return;
      }
      onClick?.(event as never);
    }
  };

  return (
    <Card
      {...props}
      className={slots.root({ className })}
      data-pressable={isPressable || undefined}
      data-variant={variant}
      onClick={(event) => {
        if (onPress) {
          void onPress({} as never);
          return;
        }
        onClick?.(event);
      }}
      onKeyDown={handleKeyDown}
      role={isPressable ? "button" : undefined}
      tabIndex={isPressable ? 0 : props.tabIndex}
      variant="transparent"
    >
      <div className={slots.media()}>
        <MediaImage
          alt={imageAlt}
          className={slots.image({ className: imageClassName })}
          image={image}
          sizes={variant === "compact" ? "260px" : "276px"}
        />
        <div aria-hidden className={slots.scrim()} />
      </div>

      {showTopBar ? (
        <div className={slots.topBar()}>
          {showBadge ? (
            <Chip className={slots.badge()} size="sm">
              <Chip.Label>{badge}</Chip.Label>
            </Chip>
          ) : (
            <span />
          )}
          {showAction ? (
            <Button
              aria-label={actionLabel}
              className={slots.action()}
              isIconOnly
              onClick={(event) => event.stopPropagation()}
              onPress={onAction}
              size="lg"
              variant="secondary"
            >
              {actionIcon ?? (
                <ShapeCircle className={slots.actionIcon()} size={16} />
              )}
            </Button>
          ) : (
            <span />
          )}
        </div>
      ) : null}

      <div className={slots.body()}>
        <Typography className={slots.title()} type={titleType} weight="bold">
          {title}
        </Typography>

        {showSubtitle ? (
          <Typography className={slots.subtitle()} type="body-sm">
            {subtitle}
          </Typography>
        ) : null}

        {showMeta ? (
          <div className={slots.meta()}>
            {metaItems.map((item, index) => (
              <span key={index} className={slots.metaGroup()}>
                {index > 0 ? (
                  <span aria-hidden className={slots.metaSeparator()}>
                    •
                  </span>
                ) : null}
                <span className={slots.metaItem()}>{item}</span>
              </span>
            ))}
          </div>
        ) : null}

        {showRating ? (
          <div className={slots.ratingRow()}>
            <StarRow
              maxRating={maxRating}
              rating={rating}
              starClassName={slots.star()}
              starEmptyClassName={slots.starEmpty()}
              starFillClassName={slots.starFill()}
              starWrapClassName={slots.starWrap()}
              starsClassName={slots.stars()}
            />
            <Typography className={slots.ratingValue()} type="body-sm">
              {formatRating(rating)}
              {ratingCount != null ? (
                <span className={slots.ratingCount()}> ({ratingCount})</span>
              ) : null}
            </Typography>
          </div>
        ) : null}

        {showStats ? (
          <div className={slots.stats()}>
            {visibleStats.map((item, index) => (
              <span key={index} className={slots.statGroup()}>
                {index > 0 ? (
                  <span aria-hidden className={slots.statSeparator()}>
                    •
                  </span>
                ) : null}
                <span className={slots.statItem()}>
                  {item.icon ?? (
                    <ShapeCircle
                      aria-hidden
                      className={slots.statIcon()}
                      size={14}
                    />
                  )}
                  <span className={slots.statLabel()}>{item.label}</span>
                </span>
              </span>
            ))}
          </div>
        ) : null}

        {showAuthor ? (
          <div className={slots.author()}>
            <Avatar className={slots.avatar()} size="sm">
              {author.avatarSrc ? (
                <Avatar.Image
                  alt={author.avatarAlt ?? ""}
                  src={author.avatarSrc}
                />
              ) : null}
              <Avatar.Fallback>
                {typeof author.name === "string" ? author.name.slice(0, 1) : "A"}
              </Avatar.Fallback>
            </Avatar>
            {brandAwareText(author.name)}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
