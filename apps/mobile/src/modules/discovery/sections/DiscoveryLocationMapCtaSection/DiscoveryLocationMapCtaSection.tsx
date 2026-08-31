"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { useTheme } from "@repo/theme";
import { ProgressiveBlur } from "@repo/ui/kit/ProgressiveBlur";
import Image from "next/image";
import { discoveryHomeMapCtaSectionVariants } from "./DiscoveryLocationMapCtaSection.styles";
import type { DiscoveryLocationMapCtaSectionProps } from "./DiscoveryLocationMapCtaSection.types";

const MAP_CTA_IMAGE_LIGHT = "/discovery/map-cta.jpg";
const MAP_CTA_IMAGE_DARK = "/discovery/map-cta-dark.jpg";
const CTA_ICON_SIZE = 16;

export function DiscoveryLocationMapCtaSection({
  title,
  subtitle,
  ctaLabel,
  onPress,
}: DiscoveryLocationMapCtaSectionProps) {
  const { resolvedTheme } = useTheme();
  const colorScheme = resolvedTheme === "dark" ? "dark" : "light";
  const slots = discoveryHomeMapCtaSectionVariants({ colorScheme });
  const mapImageSrc =
    colorScheme === "dark" ? MAP_CTA_IMAGE_DARK : MAP_CTA_IMAGE_LIGHT;

  return (
    <section aria-label={title} className={slots.root()}>
      <Button
        aria-label={ctaLabel}
        className={slots.pressable()}
        fullWidth
        onPress={onPress}
        variant="ghost"
      >
        <header className={slots.copy()}>
          <Typography
            align="center"
            className={slots.title()}
            type="h4"
            weight="bold"
          >
            {title}
          </Typography>
          <Typography
            align="center"
            className={slots.subtitle()}
            color="muted"
            type="body-sm"
          >
            {subtitle}
          </Typography>
        </header>

        <div className={slots.mapFrame()}>
          <Image
            alt=""
            aria-hidden
            className={slots.mapImage()}
            fill
            key={mapImageSrc}
            priority
            sizes="(max-width: 768px) 100vw, 24rem"
            src={mapImageSrc}
          />
          <div aria-hidden className={slots.mapFade()}>
            <ProgressiveBlur
              blurIntensity={2}
              blurLayers={8}
              className={slots.mapBlur()}
              direction="bottom"
            />
            <div className={slots.mapWash()} />
          </div>
          <span aria-hidden className={slots.ctaPill()}>
            {ctaLabel}
            <ChevronRight className={slots.ctaIcon()} size={CTA_ICON_SIZE} />
          </span>
        </div>
      </Button>
    </section>
  );
}
