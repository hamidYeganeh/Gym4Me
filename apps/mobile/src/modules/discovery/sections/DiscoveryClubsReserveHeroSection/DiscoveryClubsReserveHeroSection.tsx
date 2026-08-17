"use client";

import { Button, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { discoveryClubsReserveHeroSectionVariants as styles } from "./DiscoveryClubsReserveHeroSection.styles";
import type { DiscoveryClubsReserveHeroSectionProps } from "./DiscoveryClubsReserveHeroSection.types";

export function DiscoveryClubsReserveHeroSection({
  clubTitle,
  clubLocation,
  clubImage,
  onBack,
  children,
}: DiscoveryClubsReserveHeroSectionProps) {
  const t = useTranslations("ReserveFlow");
  const slots = styles();

  return (
    <>
      <Header
        className="absolute inset-x-0 top-0 z-20"
        startContent={
          <Button
            aria-label={t("back")}
            isIconOnly
            onPress={onBack}
            size="lg"
            variant="secondary"
          >
            <ChevronLeft size={20} />
          </Button>
        }
      />

      <div className={slots.hero()}>
        <Image
          alt={clubTitle}
          className={slots.heroImage()}
          fill
          priority
          sizes="100vw"
          src={clubImage || PLACEHOLDER_IMAGE}
        />
        <div aria-hidden className={slots.heroScrim()} />
      </div>

      <div className={slots.sheet()}>
        <div className={slots.titleBlock()}>
          <Typography className={slots.eyebrow()} type="body-sm">
            {t("eyebrow")}
          </Typography>
          <Typography className={slots.title()} type="h1" weight="bold">
            {t("title", { club: clubTitle })}
          </Typography>
          {clubLocation ? (
            <Typography className={slots.location()} type="body-sm">
              {clubLocation}
            </Typography>
          ) : (
            <Typography className={slots.location()} type="body-sm">
              {t("subtitle")}
            </Typography>
          )}
        </div>
        {children}
      </div>
    </>
  );
}
