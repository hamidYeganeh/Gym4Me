"use client";

import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Clock } from "@repo/icons/Clock";
import { Fire1 } from "@repo/icons/Fire1";
import { ShapeCircle } from "@repo/icons/ShapeCircle";
import { StarFull } from "@repo/icons/StarFull";
import type { KeyboardEvent, ReactNode } from "react";
import { MediaImage } from "../../common/MediaImage";
import { classCardVariants } from "./ClassCard.styles";
import type { ClassCardProps } from "./ClassCard.types";

const STAT_ICON_SIZE = 16;
const ACTION_ICON_SIZE = 14;

function authorInitial(name: ReactNode) {
  return typeof name === "string" ? name.slice(0, 1) : "A";
}

export function ClassCard({
  variant = "dark",
  image,
  imageAlt = "",
  badge,
  title,
  author,
  kcal,
  minutes,
  score,
  kcalLabel = "kcal",
  minutesLabel = "minutes",
  scoreLabel = "score",
  kcalIcon,
  minutesIcon,
  scoreIcon,
  actionLabel = "Action",
  actionIcon,
  onAction,
  onPress,
  onClick,
  imageClassName,
  className,
  ...props
}: ClassCardProps) {
  const slots = classCardVariants({ variant });
  const isPressable = onPress != null || onClick != null;
  const actionGlyph = actionIcon ?? (
    <ShapeCircle className={slots.actionIcon()} size={ACTION_ICON_SIZE} />
  );

  const stats = [
    {
      key: "kcal",
      value: kcal,
      label: kcalLabel,
      icon:
        kcalIcon ?? (
          <Fire1 aria-hidden className={slots.statIcon()} size={STAT_ICON_SIZE} />
        ),
    },
    {
      key: "minutes",
      value: minutes,
      label: minutesLabel,
      icon:
        minutesIcon ?? (
          <Clock aria-hidden className={slots.statIcon()} size={STAT_ICON_SIZE} />
        ),
    },
    {
      key: "score",
      value: score,
      label: scoreLabel,
      icon:
        scoreIcon ?? (
          <StarFull
            aria-hidden
            className={slots.statIcon()}
            size={STAT_ICON_SIZE}
          />
        ),
    },
  ] as const;

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
          sizes="340px"
        />
        <div aria-hidden className={slots.scrim()} />
      </div>

      <div className={slots.topBar()}>
        <Chip className={slots.badge()} size="sm" variant="primary">
          <Chip.Label>{badge}</Chip.Label>
        </Chip>

        {onAction != null ? (
          <Button
            aria-label={actionLabel}
            className={slots.action()}
            isIconOnly
            onClick={(event) => event.stopPropagation()}
            onPress={onAction}
            size="lg"
            variant="ghost"
          >
            {actionGlyph}
          </Button>
        ) : (
          <span aria-hidden className={slots.action()}>
            {actionGlyph}
          </span>
        )}
      </div>

      <div className={slots.body()}>
        <Typography className={slots.title()} type="h3" weight="bold">
          {title}
        </Typography>

        <div className={slots.author()}>
          <Avatar className={slots.avatar()} size="sm">
            {author.avatarSrc ? (
              <Avatar.Image
                alt={author.avatarAlt ?? ""}
                src={author.avatarSrc}
              />
            ) : null}
            <Avatar.Fallback>{authorInitial(author.name)}</Avatar.Fallback>
          </Avatar>
          <Typography className={slots.authorName()} type="body-sm">
            {author.name}
          </Typography>
        </div>

        <div className={slots.stats()}>
          {stats.map((stat) => (
            <div className={slots.stat()} key={stat.key}>
              <span className={slots.statValueRow()}>
                {stat.icon}
                <Typography className={slots.statValue()} type="body" weight="bold">
                  {stat.value}
                </Typography>
              </span>
              <Typography className={slots.statLabel()} type="body-xs">
                {stat.label}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
