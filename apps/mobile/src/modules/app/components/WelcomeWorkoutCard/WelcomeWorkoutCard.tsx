"use client";

import { Button, Card, Chip, Typography } from "@heroui/react";
import { Bookmark, Clock, Fire1, StarFull } from "@repo/icons";
import { welcomeWorkoutCardVariants } from "./WelcomeWorkoutCard.styles";
import type { WelcomeWorkoutCardProps } from "./WelcomeWorkoutCard.types";

export function WelcomeWorkoutCard({
  className,
  category,
  title,
  coach,
  durationValue,
  durationUnit,
  ratingValue,
  ratingUnit,
  caloriesValue,
  caloriesUnit,
  bookmarkLabel,
  categoryTone = "blue",
}: WelcomeWorkoutCardProps) {
  const styles = welcomeWorkoutCardVariants({ categoryTone });

  return (
    <Card className={styles.root({ className })} variant="transparent">
      <Card.Header className={styles.header()}>
        <Chip className={styles.category()} size="sm">
          <Chip.Label>{category}</Chip.Label>
        </Chip>

        <Button
          aria-label={bookmarkLabel}
          className={styles.bookmark()}
          isIconOnly
          size="lg"
          variant="ghost"
        >
          <Bookmark size={16} />
        </Button>
      </Card.Header>

      <Card.Footer className={styles.body()}>
        <div className={styles.copy()}>
          <Typography className={styles.title()} type="h3" weight="bold">
            {title}
          </Typography>
          <Typography className={styles.coach()} type="body-sm">
            {coach}
          </Typography>
        </div>

        <div className={styles.stats()}>
          <div className={styles.stat()}>
            <span className={styles.statRow()}>
              <Clock aria-hidden className={styles.statIcon()} size={16} />
              <span className={styles.statValue()}>{durationValue}</span>
            </span>
            <span className={styles.statUnit()}>{durationUnit}</span>
          </div>

          <div className={styles.stat()}>
            <span className={styles.statRow()}>
              <StarFull
                aria-hidden
                className={`${styles.statIcon()} text-stats-yellow`}
                size={16}
              />
              <span className={styles.statValue()}>{ratingValue}</span>
            </span>
            <span className={styles.statUnit()}>{ratingUnit}</span>
          </div>

          <div className={styles.stat()}>
            <span className={styles.statRow()}>
              <Fire1
                aria-hidden
                className={`${styles.statIcon()} text-stats-orange`}
                size={16}
              />
              <span className={styles.statValue()}>{caloriesValue}</span>
            </span>
            <span className={styles.statUnit()}>{caloriesUnit}</span>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
}
