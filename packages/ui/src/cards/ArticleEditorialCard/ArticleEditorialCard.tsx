"use client";

import type { KeyboardEvent } from "react";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { Clock } from "@repo/icons/Clock";
import { User } from "@repo/icons/User";
import { brandAwareText } from "../../kit/LineShadowText";
import { articleEditorialCardVariants } from "./ArticleEditorialCard.styles";
import type { ArticleEditorialCardProps } from "./ArticleEditorialCard.types";

const META_ICON_SIZE = 14;
const ACTION_ICON_SIZE = 18;

export function ArticleEditorialCard({
  category,
  categoryIcon,
  dateLabel,
  title,
  author,
  readingTimeLabel,
  actionLabel,
  onPress,
  className,
  onKeyDown,
  ...props
}: ArticleEditorialCardProps) {
  const slots = articleEditorialCardVariants();
  const isPressable = onPress != null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!isPressable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void onPress({} as never);
    }
  };

  return (
    <Card
      {...props}
      aria-label={actionLabel}
      className={slots.root({ className })}
      role={isPressable ? "button" : undefined}
      tabIndex={isPressable ? 0 : props.tabIndex}
      variant="transparent"
      onClick={() => {
        if (onPress) void onPress({} as never);
      }}
      onKeyDown={handleKeyDown}
    >
      <Chip className={slots.chip()} size="sm" variant="tertiary">
        {categoryIcon ? (
          <span aria-hidden className={slots.chipIcon()}>
            {categoryIcon}
          </span>
        ) : null}
        <Chip.Label className={slots.chipLabel()}>{category}</Chip.Label>
      </Chip>

      {dateLabel != null && dateLabel !== "" ? (
        <Typography className={slots.date()} type="body-sm">
          {dateLabel}
        </Typography>
      ) : null}

      <Typography className={slots.title()} type="h3" weight="bold">
        {title}
      </Typography>

      <div className={slots.footer()}>
        <div className={slots.meta()}>
          {author != null && author !== "" ? (
            <div className={slots.metaRow()}>
              <User
                aria-hidden
                className={slots.metaIcon()}
                size={META_ICON_SIZE}
              />
              {brandAwareText(author)}
            </div>
          ) : null}
          {readingTimeLabel != null && readingTimeLabel !== "" ? (
            <div className={slots.metaRow()}>
              <Clock
                aria-hidden
                className={slots.metaIcon()}
                size={META_ICON_SIZE}
              />
              <Typography className={slots.metaText()} type="body-xs">
                {readingTimeLabel}
              </Typography>
            </div>
          ) : null}
        </div>

        <Button
          aria-label={actionLabel}
          className={slots.action()}
          isIconOnly
          size="lg"
          variant="ghost"
          onClick={(event) => event.stopPropagation()}
          onPress={onPress}
        >
          <ArrowUpRight rtlMirror={false} size={ACTION_ICON_SIZE} />
        </Button>
      </div>
    </Card>
  );
}
