"use client";

import { Button, Chip, Surface, Typography } from "@heroui/react";
import { MapPin1 } from "@repo/icons/MapPin1";
import { StarFull } from "@repo/icons/StarFull";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useState } from "react";
import { DiscoveryClubsDetailHeroSectionHeader } from "../DiscoveryClubsDetailHeroSectionHeader";
import { DiscoveryClubsDetailHeroSectionLightbox } from "../DiscoveryClubsDetailHeroSectionLightbox";
import { DiscoveryClubsDetailHeroSectionPullToView } from "../DiscoveryClubsDetailHeroSectionPullToView";
import { discoveryClubsDetailHeroSectionStyles as styles } from "./DiscoveryClubsDetailHeroSection.styles";
import type {
  DiscoveryClubsDetailHeroSectionGalleryItem,
  DiscoveryClubsDetailHeroSectionProps,
} from "./DiscoveryClubsDetailHeroSection.types";

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

export function DiscoveryClubsDetailHeroSection({
  title,
  location,
  openHoursLabel,
  isOpen,
  gallery: galleryProp,
  images,
  rating,
  reviewCount = 0,
  isFavorite = false,
  children,
}: DiscoveryClubsDetailHeroSectionProps) {
  const t = useTranslations("ClubDetail");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const gallery: DiscoveryClubsDetailHeroSectionGalleryItem[] =
    galleryProp && galleryProp.length > 0
      ? galleryProp
      : (images ?? []).length > 0
        ? (images ?? []).map((url) => ({ url }))
        : [{ url: PLACEHOLDER_IMAGE }];
  const imageCount = gallery.length;
  const activeImage =
    gallery[activeIndex]?.url ?? gallery[0]?.url ?? PLACEHOLDER_IMAGE;
  const showRating = typeof rating === "number" && Number.isFinite(rating);
  const showOpenStatus = typeof isOpen === "boolean";

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
      <DiscoveryClubsDetailHeroSectionHeader isFavorite={isFavorite} />

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

          <Chip
            aria-label={t("galleryCount", {
              current: activeIndex + 1,
              total: imageCount,
            })}
            className={styles.counter}
            size="sm"
          >
            <Chip.Label className={styles.counterLabel}>
              {t("imageCounter", {
                current: activeIndex + 1,
                total: imageCount,
              })}
            </Chip.Label>
          </Chip>

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
                  aria-label={
                    image.title ?? t("selectImage", { index: index + 1 })
                  }
                  className={[
                    styles.thumbButton,
                    isActive ? styles.thumbActive : styles.thumbIdle,
                  ].join(" ")}
                  isIconOnly
                  key={`${image.url}-${index}`}
                  onPress={() => goToImage(index)}
                  size="lg"
                  variant="ghost"
                >
                  <Image
                    alt={image.title ?? ""}
                    className={styles.thumbImage}
                    draggable={false}
                    fill
                    sizes="48px"
                    src={image.url || PLACEHOLDER_IMAGE}
                  />
                </Button>
              );
            })}
          </div>
        </section>
      </DiscoveryClubsDetailHeroSectionPullToView>

      <Surface aria-hidden={!children} className={styles.sheet} variant="default">
        <div className={styles.sheetHeader}>
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

            {showOpenStatus || openHoursLabel ? (
              <div className={styles.metaRow}>
                {showOpenStatus ? (
                  <Chip
                    className={
                      isOpen ? styles.openChip : styles.closedChip
                    }
                    size="sm"
                  >
                    <Chip.Label>
                      {isOpen ? t("openNow") : t("closedNow")}
                    </Chip.Label>
                  </Chip>
                ) : null}
                {openHoursLabel ? (
                  <Typography
                    className={styles.hoursText}
                    color="muted"
                    type="body-xs"
                  >
                    <span className="sr-only">{t("hoursLabel")}: </span>
                    {openHoursLabel}
                  </Typography>
                ) : null}
              </div>
            ) : null}
          </div>

          {showRating ? (
            <Surface className={styles.ratingCard} variant="secondary">
              <div className={styles.ratingValue}>
                <Typography
                  className={styles.ratingScore}
                  type="body"
                  weight="semibold"
                >
                  {formatRating(rating)}
                </Typography>
                <StarFull aria-hidden className={styles.ratingStar} size={14} />
              </div>
              <Typography
                className={styles.ratingMeta}
                color="muted"
                type="body-xs"
              >
                {t("reviewsCount", { count: reviewCount })}
              </Typography>
            </Surface>
          ) : null}
        </div>

        {children}
      </Surface>

      <DiscoveryClubsDetailHeroSectionLightbox
        activeIndex={activeIndex}
        images={gallery}
        isFavorite={isFavorite}
        isOpen={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
        onSelectImage={goToImage}
        title={t("galleryTitle")}
      />
    </>
  );
}
