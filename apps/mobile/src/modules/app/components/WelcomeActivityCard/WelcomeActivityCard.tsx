"use client";

import { Card, Typography } from "@heroui/react";
import { Heart, HeartEcg, Wind } from "@repo/icons";
import { welcomeActivityCardVariants } from "./WelcomeActivityCard.styles";
import type {
  WelcomeActivityCardProps,
  WelcomeActivityTone,
} from "./WelcomeActivityCard.types";

const TONE_ICON: Record<
  WelcomeActivityTone,
  typeof Heart | typeof Wind | typeof HeartEcg
> = {
  light: Heart,
  calm: Wind,
  intense: HeartEcg,
};

export function WelcomeActivityCard({
  className,
  title,
  toneLabel,
  tone,
  icon: Icon,
}: WelcomeActivityCardProps) {
  const styles = welcomeActivityCardVariants({ tone });
  const ToneIcon = TONE_ICON[tone];

  return (
    <Card className={styles.root({ className })} variant="transparent">
      <Icon aria-hidden className={styles.icon()} size={36} />
      <Card.Footer className={styles.footer()}>
        <Typography className={styles.title()} type="h3" weight="bold">
          {title}
        </Typography>
        <span className={styles.toneRow()}>
          <ToneIcon aria-hidden className={styles.toneIcon()} size={14} />
          {toneLabel}
        </span>
      </Card.Footer>
    </Card>
  );
}
