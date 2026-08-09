"use client";

import { Card, Typography } from "@heroui/react";
import { welcomeAchievementCardVariants } from "./WelcomeAchievementCard.styles";
import type {
  WelcomeAchievementCardProps,
  WelcomeAchievementTone,
} from "./WelcomeAchievementCard.types";

const TONE_FILL: Record<
  WelcomeAchievementTone,
  { outer: string; inner: string; shine: string }
> = {
  orange: {
    outer: "var(--stats-orange)",
    inner: "color-mix(in oklch, var(--stats-orange) 72%, black)",
    shine: "color-mix(in oklch, var(--stats-orange) 55%, white)",
  },
  blue: {
    outer: "var(--stats-blue)",
    inner: "color-mix(in oklch, var(--stats-blue) 70%, black)",
    shine: "color-mix(in oklch, var(--stats-blue) 50%, white)",
  },
  silver: {
    outer: "#c4c4cc",
    inner: "#7a7a85",
    shine: "#ececf1",
  },
};

const HEX_PATH = "M40 4 L72 22 L72 58 L40 76 L8 58 L8 22 Z";
const HEX_INNER_PATH = "M40 12 L64 26 L64 54 L40 68 L16 54 L16 26 Z";
const SHIELD_PATH =
  "M40 6 C52 10, 68 12, 70 14 L70 42 C70 58, 56 70, 40 78 C24 70, 10 58, 10 42 L10 14 C12 12, 28 10, 40 6 Z";
const SHIELD_INNER_PATH =
  "M40 14 C50 17, 62 19, 63 20 L63 42 C63 54, 52 64, 40 70 C28 64, 17 54, 17 42 L17 20 C18 19, 30 17, 40 14 Z";

export function WelcomeAchievementCard({
  className,
  title,
  status,
  tone,
  badgeShape = "hex",
  icon: Icon,
}: WelcomeAchievementCardProps) {
  const styles = welcomeAchievementCardVariants({ tone });
  const fill = TONE_FILL[tone];
  const outer = badgeShape === "shield" ? SHIELD_PATH : HEX_PATH;
  const inner = badgeShape === "shield" ? SHIELD_INNER_PATH : HEX_INNER_PATH;
  const gradientId = `welcome-achievement-${tone}-${badgeShape}`;

  return (
    <Card className={styles.root({ className })} variant="transparent">
      <div className={styles.badgeWrap()}>
        <svg
          aria-hidden
          className={styles.badgeSvg()}
          fill="none"
          viewBox="0 0 80 82"
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="16"
              x2="64"
              y1="8"
              y2="74"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={fill.shine} />
              <stop offset="0.45" stopColor={fill.outer} />
              <stop offset="1" stopColor={fill.inner} />
            </linearGradient>
          </defs>
          <path d={outer} fill={`url(#${gradientId})`} />
          <path d={inner} fill={fill.inner} opacity="0.92" />
          <path
            d={outer}
            stroke={fill.shine}
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
        </svg>
        <Icon aria-hidden className={styles.badgeIcon()} size={28} />
      </div>

      <div className={styles.copy()}>
        <Typography className={styles.title()} type="h3" weight="bold">
          {title}
        </Typography>
        <Typography className={styles.status()} type="body-xs">
          {status}
        </Typography>
      </div>
    </Card>
  );
}
