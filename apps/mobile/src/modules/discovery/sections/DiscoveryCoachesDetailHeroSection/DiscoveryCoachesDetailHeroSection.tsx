"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Surface } from "@heroui/react/surface";
import { Typography } from "@heroui/react/typography";
import { DotThreeHorizontal } from "@repo/icons/DotThreeHorizontal";
import { MapPin1 } from "@repo/icons/MapPin1";
import { SealCheck } from "@repo/icons/SealCheck";
import { StarFull } from "@repo/icons/StarFull";
import { spring } from "@repo/theme";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { GalleryMediaItem } from "../../lib/gallery-media";
import { DiscoveryClubsDetailHeroSectionLightbox } from "../DiscoveryClubsDetailHeroSectionLightbox";
import { DiscoveryClubsDetailHeroSectionPullToView } from "../DiscoveryClubsDetailHeroSectionPullToView";
import {
  COACH_DETAIL_HEADER_SCROLL_RANGE,
  DiscoveryCoachesDetailHeroSectionHeader,
} from "../DiscoveryCoachesDetailHeroSectionHeader";
import { discoveryCoachesDetailHeroSectionStyles as styles } from "./DiscoveryCoachesDetailHeroSection.styles";
import type { DiscoveryCoachesDetailHeroSectionProps } from "./DiscoveryCoachesDetailHeroSection.types";

const HERO_THUMB_PREVIEW_COUNT = 3;
/** Approx collapsed control bar — used to decide when the hero has passed. */
const STICKY_BAR_APPROX = 64;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function formatRating(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

export function DiscoveryCoachesDetailHeroSection({
  coach,
  children,
}: DiscoveryCoachesDetailHeroSectionProps) {
  const t = useTranslations("CoachDetail");
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [morphStartY, setMorphStartY] = useState(Number.POSITIVE_INFINITY);
  const heroRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const sync = () => {
      // Morph begins once the hero has scrolled away and the sheet title
      // reaches the sticky header zone (accounts for sheet `-mt-10` overlap).
      const heroHeight = el.offsetHeight;
      setMorphStartY(Math.max(0, heroHeight - STICKY_BAR_APPROX - 40));
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { scrollY } = useScroll();
  const rawProgress = useTransform(scrollY, (y) =>
    clamp01((y - morphStartY) / COACH_DETAIL_HEADER_SCROLL_RANGE),
  );
  const smoothProgress = useSpring(rawProgress, spring.default);
  const progress = reduceMotion ? rawProgress : smoothProgress;
  const morph = useTransform(progress, (p) => smoothstep(p));

  /** Sheet title yields to the header identity once the hero has passed. */
  const sheetTitleOpacity = useTransform([scrollY, morph], ([y, p]) => {
    const scroll = typeof y === "number" ? y : 0;
    const morphP = typeof p === "number" ? p : 0;
    if (scroll < morphStartY) return 1;
    if (morphP < 0.2) return 1 - morphP / 0.2;
    return 0;
  });
  const sheetTitleVisibility = useTransform([scrollY, morph], ([y, p]) => {
    const scroll = typeof y === "number" ? y : 0;
    const morphP = typeof p === "number" ? p : 0;
    return scroll < morphStartY || morphP < 0.2 ? "visible" : "hidden";
  });

  // Prefer coach photo URLs (`images` / avatar) for the hero — same role as
  // club venue photos — instead of the richer body `gallery` (which may mix media).
  const safeGallery: GalleryMediaItem[] = (() => {
    const fromImages = coach.images
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url, mediaKind: "image" as const }));
    if (fromImages.length > 0) return fromImages;

    const fromAvatar = coach.avatar?.trim();
    if (fromAvatar) {
      return [{ url: fromAvatar, mediaKind: "image" as const }];
    }

    const fromGallery = coach.gallery.filter(
      (item) => item.url && (item.mediaKind ?? "image") === "image",
    );
    if (fromGallery.length > 0) return fromGallery;

    return [{ url: PLACEHOLDER_IMAGE, mediaKind: "image" as const }];
  })();
  const imageCount = safeGallery.length;
  const activeImage =
    safeGallery[activeIndex]?.url ??
    safeGallery[0]?.url ??
    PLACEHOLDER_IMAGE;
  const showRating =
    typeof coach.rating === "number" &&
    Number.isFinite(coach.rating) &&
    coach.rating > 0;

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
      <DiscoveryCoachesDetailHeroSectionHeader
        avatarSrc={coach.avatar}
        isFavorite={coach.isFavorite}
        morphStartY={morphStartY}
        name={coach.name}
      />

      <DiscoveryClubsDetailHeroSectionPullToView
        onPullOpen={() => setIsLightboxOpen(true)}
        onSwipeHorizontal={onSwipeHorizontal}
      >
        <section
          aria-label={coach.name}
          aria-roledescription="carousel"
          className={styles.carousel}
          ref={heroRef}
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
            aria-label={coach.name}
            className={styles.thumbs}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {safeGallery.slice(0, HERO_THUMB_PREVIEW_COUNT).map((image, index) => {
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
            <motion.div
              className={styles.titleWrap}
              style={{
                opacity: sheetTitleOpacity,
                visibility: sheetTitleVisibility,
              }}
            >
              <Typography className={styles.title} type="h2" weight="bold">
                {coach.name}
              </Typography>
            </motion.div>

            {coach.location ? (
              <div className={styles.metaRow}>
                <MapPin1 aria-hidden className="shrink-0" size={15} />
                <Typography className={styles.metaText} type="body-sm">
                  {coach.location}
                </Typography>
              </div>
            ) : null}

            <div className={styles.statsRow}>
              {coach.isVerified ? (
                <Chip className={styles.verifiedChip} size="sm">
                  <SealCheck aria-hidden size={14} />
                  <Chip.Label>{t("verified")}</Chip.Label>
                </Chip>
              ) : null}
              {coach.specialty ? (
                <Chip className={styles.specialtyChip} size="sm">
                  <Chip.Label>{coach.specialty}</Chip.Label>
                </Chip>
              ) : null}
              {coach.availabilityLabel ? (
                <Typography
                  className={styles.availabilityText}
                  color="muted"
                  type="body-xs"
                >
                  {coach.availabilityLabel}
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
                  {formatRating(coach.rating)}
                </Typography>
                <StarFull aria-hidden className={styles.ratingStar} size={14} />
              </div>
              <Typography
                className={styles.ratingMeta}
                color="muted"
                type="body-xs"
              >
                {t("reviewsCount", { count: coach.ratingCount })}
              </Typography>
            </Surface>
          ) : null}
        </div>

        {children}
      </Surface>

      <DiscoveryClubsDetailHeroSectionLightbox
        activeIndex={activeIndex}
        images={safeGallery}
        isFavorite={coach.isFavorite}
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
