"use client";

import { Button, Typography } from "@heroui/react";
import { MediaImage } from "@repo/ui/common/MediaImage";
import { discoveryHomeHeroSectionVariants } from "./DiscoveryHomeHeroSection.styles";
import type { DiscoveryHomeHeroSectionProps } from "./DiscoveryHomeHeroSection.types";

export function DiscoveryHomeHeroSection({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  onCta,
  image,
  imageAlt = "",
}: DiscoveryHomeHeroSectionProps) {
  const slots = discoveryHomeHeroSectionVariants();

  return (
    <section className={slots.root()}>
      <MediaImage
        alt={imageAlt}
        aria-hidden={imageAlt ? undefined : true}
        className={slots.media()}
        image={image}
        sizes="(max-width: 768px) 100vw, 36rem"
      />
      <div aria-hidden className={slots.scrim()} />
      <div aria-hidden className={slots.accentRail()} />
      <div className={slots.content()}>
        <div className={slots.copy()}>
          <Typography className={slots.eyebrow()} type="body-xs" weight="semibold">
            {eyebrow}
          </Typography>
          <Typography className={slots.title()} type="h1" weight="bold">
            {title}
          </Typography>
          <Typography className={slots.subtitle()} type="body-sm">
            {subtitle}
          </Typography>
        </div>
        <Button className={slots.cta()} onPress={onCta} size="lg" variant="primary">
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
