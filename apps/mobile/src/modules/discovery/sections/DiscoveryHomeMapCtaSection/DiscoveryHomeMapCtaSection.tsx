"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { MapTrifold } from "@repo/icons/MapTrifold";
import { discoveryHomeMapCtaSectionVariants } from "./DiscoveryHomeMapCtaSection.styles";
import type { DiscoveryHomeMapCtaSectionProps } from "./DiscoveryHomeMapCtaSection.types";

export function DiscoveryHomeMapCtaSection({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  onPress,
}: DiscoveryHomeMapCtaSectionProps) {
  const slots = discoveryHomeMapCtaSectionVariants();

  return (
    <Button
      aria-label={ctaLabel}
      className={slots.root()}
      onPress={onPress}
      variant="ghost"
    >
      <div aria-hidden className={slots.grid()} />
      <div aria-hidden className={slots.glow()} />
      <span aria-hidden className={slots.pin()}>
        <MapTrifold size={20} />
      </span>
      <div className={slots.content()}>
        <div className={slots.copy()}>
          <Typography className={slots.eyebrow()} type="body-xs" weight="semibold">
            {eyebrow}
          </Typography>
          <Typography className={slots.title()} type="h2" weight="bold">
            {title}
          </Typography>
          <Typography className={slots.subtitle()} type="body-sm">
            {subtitle}
          </Typography>
        </div>
        <Typography className={slots.ctaHint()} type="body-sm">
          {ctaLabel}
        </Typography>
      </div>
    </Button>
  );
}
