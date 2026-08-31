"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import Image from "next/image";
import { discoveryHomeMapCtaSectionVariants } from "./DiscoveryLocationMapCtaSection.styles";
import type { DiscoveryLocationMapCtaSectionProps } from "./DiscoveryLocationMapCtaSection.types";

const MAP_CTA_IMAGE = "/discovery/map-cta.jpg";
const CTA_ICON_SIZE = 16;

export function DiscoveryLocationMapCtaSection({
  title,
  subtitle,
  ctaLabel,
  onPress,
}: DiscoveryLocationMapCtaSectionProps) {
  const slots = discoveryHomeMapCtaSectionVariants();

  return (
    <section aria-label={title} className={slots.root()}>
      <Button
        aria-label={ctaLabel}
        className={slots.pressable()}
        onPress={onPress}
        size="lg"
        variant="ghost"
      >
        <div className={slots.copy()}>
          <Typography className={slots.title()} type="h3" weight="bold">
            {title}
          </Typography>
          <Typography className={slots.subtitle()} type="body-sm">
            {subtitle}
          </Typography>
        </div>

        <div className={slots.mapFrame()}>
          <Image
            alt=""
            aria-hidden
            className={slots.mapImage()}
            fill
            sizes="(max-width: 768px) 100vw, 24rem"
            src={MAP_CTA_IMAGE}
          />
          <span aria-hidden className={slots.ctaPill()}>
            {ctaLabel}
            <ChevronLeft className={slots.ctaIcon()} rtlMirror size={CTA_ICON_SIZE} />
          </span>
        </div>
      </Button>
    </section>
  );
}
