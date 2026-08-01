"use client";

import { Button, Card, Chip, Typography } from "@heroui/react";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Clock } from "@repo/icons/Clock";
import { Play } from "@repo/icons/Play";
import { MediaImage } from "../../common/MediaImage";
import { workoutCardVariants } from "./WorkoutCard.styles";
import type { WorkoutCardProps } from "./WorkoutCard.types";

export function WorkoutCard({
  image,
  imageAlt = "",
  category,
  title,
  sets,
  duration,
  playLabel,
  onPlay,
  imageClassName,
  className,
  ...props
}: WorkoutCardProps) {
  const slots = workoutCardVariants();

  return (
    <Card
      className={slots.root({ className })}
      variant="transparent"
      {...props}
    >
      <MediaImage
        alt={imageAlt}
        className={slots.image({ className: imageClassName })}
        image={image}
        sizes="260px"
      />

      <div aria-hidden className={slots.scrim()} />

      <div className={slots.body()}>
        <Chip className={slots.category()} size="sm">
          <Chip.Label>{category}</Chip.Label>
        </Chip>

        <div className={slots.bottom()}>
          <div className={slots.info()}>
            <Typography className={slots.title()} type="h3" weight="bold">
              {title}
            </Typography>

            <div className={slots.meta()}>
              <span className={slots.metaItem()}>
                <BarbellHorizontal
                  aria-hidden
                  className={slots.metaIcon()}
                  size={14}
                />
                <Typography className={slots.metaText()} type="body-xs">
                  {sets}
                </Typography>
              </span>

              <span aria-hidden className={slots.metaSeparator()}>
                ·
              </span>

              <span className={slots.metaItem()}>
                <Clock aria-hidden className={slots.metaIcon()} size={14} />
                <Typography className={slots.metaText()} type="body-xs">
                  {duration}
                </Typography>
              </span>
            </div>
          </div>

          <Button
            aria-label={playLabel}
            className={slots.play()}
            isIconOnly
            onPress={onPlay}
            size="lg"
            variant="primary"
          >
            <Play size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
