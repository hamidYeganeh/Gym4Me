"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Surface } from "@heroui/react/surface";
import { Typography } from "@heroui/react/typography";
import { Clock } from "@repo/icons/Clock";
import { DotThreeHorizontal } from "@repo/icons/DotThreeHorizontal";
import { StarFull } from "@repo/icons/StarFull";
import { UsersThree } from "@repo/icons/UsersThree";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useState } from "react";
import { DiscoveryClubsDetailHeroSectionLightbox } from "../DiscoveryClubsDetailHeroSectionLightbox";
import { DiscoveryClubsDetailHeroSectionPullToView } from "../DiscoveryClubsDetailHeroSectionPullToView";
import { DiscoveryClubsClassDetailHeroSectionHeader } from "../DiscoveryClubsClassDetailHeroSectionHeader";
import { discoveryClubsClassDetailHeroSectionStyles as styles } from "./DiscoveryClubsClassDetailHeroSection.styles";
import type { DiscoveryClubsClassDetailHeroSectionProps } from "./DiscoveryClubsClassDetailHeroSection.types";

const HERO_THUMB_PREVIEW_COUNT = 3;

export function DiscoveryClubsClassDetailHeroSection({
  classDetail,
  children,
}: DiscoveryClubsClassDetailHeroSectionProps) {
  const t = useTranslations("ClubClassDetail");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const gallery =
    classDetail.gallery.length > 0
      ? classDetail.gallery
      : [{ url: classDetail.image || PLACEHOLDER_IMAGE }];
  const imageCount = gallery.length;
  const activeImage =
    gallery[activeIndex]?.url ?? gallery[0]?.url ?? PLACEHOLDER_IMAGE;
  const showRating =
    Boolean(classDetail.rating) && classDetail.rating !== "—";
  const coachLabel = classDetail.coachName
    ? t("coachWithName", { name: classDetail.coachName })
    : classDetail.tagline || t("coachUnknown");

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
      <DiscoveryClubsClassDetailHeroSectionHeader
        isBookmarked={classDetail.isBookmarked}
      />

      <DiscoveryClubsDetailHeroSectionPullToView
        onPullOpen={() => setIsLightboxOpen(true)}
        onSwipeHorizontal={onSwipeHorizontal}
      >
        <section
          aria-label={classDetail.title}
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
            aria-label={classDetail.title}
            className={styles.thumbs}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {gallery.slice(0, HERO_THUMB_PREVIEW_COUNT).map((image, index) => {
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

            {imageCount > HERO_THUMB_PREVIEW_COUNT ? (
              <Button
                aria-label={t("seeAllGallery")}
                className={[styles.thumbButton, styles.thumbMore].join(" ")}
                isIconOnly
                onPress={() => setIsLightboxOpen(true)}
                size="lg"
                variant="tertiary"
              >
                <DotThreeHorizontal
                  aria-hidden
                  className={styles.thumbMoreIcon}
                  size={18}
                />
              </Button>
            ) : null}
          </div>
        </section>
      </DiscoveryClubsDetailHeroSectionPullToView>

      <Surface
        aria-hidden={!children}
        className={styles.sheet}
        variant="default"
      >
        <div className={styles.sheetHeader}>
          <div className={styles.titleBlock}>
            <Typography className={styles.title} type="h2" weight="bold">
              {classDetail.title}
            </Typography>

            <div className={styles.metaRow}>
              <UsersThree aria-hidden className="shrink-0" size={15} />
              <Typography className={styles.metaText} type="body-sm">
                {coachLabel}
              </Typography>
            </div>

            <div className={styles.statsRow}>
              {classDetail.category ? (
                <Chip className={styles.categoryChip} size="sm">
                  <Chip.Label>{classDetail.category}</Chip.Label>
                </Chip>
              ) : null}
              {classDetail.durationLabel ? (
                <Typography
                  className={styles.durationText}
                  color="muted"
                  type="body-xs"
                >
                  <span className="inline-flex items-center gap-1">
                    <Clock aria-hidden size={12} />
                    <span className="sr-only">{t("durationMeta")}: </span>
                    {classDetail.durationLabel}
                  </span>
                </Typography>
              ) : null}
              {classDetail.caloriesLabel ? (
                <Typography
                  className={styles.durationText}
                  color="muted"
                  type="body-xs"
                >
                  {classDetail.caloriesLabel}
                </Typography>
              ) : null}
            </div>
          </div>

          {showRating ? (
            <Surface className={styles.ratingCard} variant="secondary">
              <div className={styles.ratingValue}>
                <Typography
                  className={styles.ratingScore}
                  type="body"
                  weight="semibold"
                >
                  {classDetail.rating}
                </Typography>
                <StarFull aria-hidden className={styles.ratingStar} size={14} />
              </div>
              <Typography
                className={styles.ratingMeta}
                color="muted"
                type="body-xs"
              >
                {t("ratingMeta")}
              </Typography>
            </Surface>
          ) : null}
        </div>

        {children}
      </Surface>

      <DiscoveryClubsDetailHeroSectionLightbox
        activeIndex={activeIndex}
        images={gallery}
        isFavorite={classDetail.isBookmarked}
        isOpen={isLightboxOpen}
        labels={{
          close: t("closeGallery"),
          favorite: t("favorite"),
          prev: t("galleryPrev"),
          next: t("galleryNext"),
          selectImage: (index) => t("selectImage", { index }),
          title: t("galleryTitle"),
        }}
        onOpenChange={setIsLightboxOpen}
        onSelectImage={goToImage}
        title={t("galleryTitle")}
      />
    </>
  );
}
