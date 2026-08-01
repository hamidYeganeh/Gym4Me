"use client";

import { Button, Typography } from "@heroui/react";
import { MapPin1 } from "@repo/icons/MapPin1";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useState } from "react";
import { DiscoveryClubsDetailHeroSectionHeader } from "../DiscoveryClubsDetailHeroSectionHeader";
import { DiscoveryClubsDetailHeroSectionLightbox } from "../DiscoveryClubsDetailHeroSectionLightbox";
import { DiscoveryClubsDetailHeroSectionPullToView } from "../DiscoveryClubsDetailHeroSectionPullToView";
import { discoveryClubsDetailHeroSectionStyles as styles } from "./DiscoveryClubsDetailHeroSection.styles";
import type { DiscoveryClubsDetailHeroSectionProps } from "./DiscoveryClubsDetailHeroSection.types";

export function DiscoveryClubsDetailHeroSection({
  title,
  location,
  images,
  isFavorite = false,
  children,
}: DiscoveryClubsDetailHeroSectionProps) {
  const t = useTranslations("ClubDetail");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const gallery = images.length > 0 ? images : [PLACEHOLDER_IMAGE];
  const imageCount = gallery.length;
  const activeImage = gallery[activeIndex] ?? gallery[0] ?? PLACEHOLDER_IMAGE;

  const goToImage = useCallback(
    (index: number) => {
      if (imageCount === 0) return;
      const next = ((index % imageCount) + imageCount) % imageCount;
      setActiveIndex(next);
    },
    [imageCount],
  );

  const onSwipeHorizontal = useCallback(
    (direction: 1 | -1) => {
      goToImage(activeIndex + direction);
    },
    [activeIndex, goToImage],
  );

  return (
    <>
      <DiscoveryClubsDetailHeroSectionPullToView
        onPullOpen={() => setIsLightboxOpen(true)}
        onSwipeHorizontal={onSwipeHorizontal}
      >
        <section
          aria-label={title}
          aria-roledescription="carousel"
          className={styles.carousel}
        >
          <Image
            alt=""
            className={styles.image}
            draggable={false}
            fill
            key={`${activeImage}-${activeIndex}`}
            priority
            sizes="100vw"
            src={activeImage}
          />
          <div aria-hidden className={styles.scrim} />

          <DiscoveryClubsDetailHeroSectionHeader isFavorite={isFavorite} />

          <div className={styles.bottomBar}>
            <div className={styles.titleBlock}>
              <Typography className={styles.title} type="h2" weight="bold">
                {title}
              </Typography>
              <div className={styles.locationRow}>
                <MapPin1 aria-hidden className="shrink-0" size={15} />
                <Typography className={styles.locationText} type="body-sm">
                  {location}
                </Typography>
              </div>
            </div>

            <div
              aria-label={title}
              className={styles.thumbs}
              onPointerDown={(event) => event.stopPropagation()}
            >
              {gallery.map((image, index) => {
                const isActive = index === activeIndex;
                return (
                  <Button
                    aria-current={isActive ? "true" : undefined}
                    aria-label={t("selectImage", { index: index + 1 })}
                    className={[
                      styles.thumbButton,
                      isActive ? styles.thumbActive : styles.thumbIdle,
                    ].join(" ")}
                    isIconOnly
                    key={`${image}-${index}`}
                    onPress={() => goToImage(index)}
                    size="lg"
                    variant="ghost"
                  >
                    <Image
                      alt=""
                      className={styles.thumbImage}
                      draggable={false}
                      fill
                      sizes="48px"
                      src={image || PLACEHOLDER_IMAGE}
                    />
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Rounded sheet edge — visual match to the design overlap */}
        <div aria-hidden={!children} className={styles.sheet}>
          {children}
        </div>
      </DiscoveryClubsDetailHeroSectionPullToView>

      <DiscoveryClubsDetailHeroSectionLightbox
        activeIndex={activeIndex}
        images={gallery}
        isOpen={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
        onSelectImage={goToImage}
      />
    </>
  );
}
