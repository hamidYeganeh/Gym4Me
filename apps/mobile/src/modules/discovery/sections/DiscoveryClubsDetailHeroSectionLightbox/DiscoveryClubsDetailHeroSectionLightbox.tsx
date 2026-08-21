"use client";

import { Button } from "@heroui/react/button";
import { Modal } from "@heroui/react/modal";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { Heart } from "@repo/icons/Heart";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { SWIPER_SPEED, swiperFreeOptions, swiperOptions } from "@repo/ui/lib/swiper";
import { useSwiperLazyLoad } from "@repo/ui/lib/use-swiper-lazy-load";
import { useSwiperSlideTween } from "@repo/ui/lib/use-swiper-slide-tween";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { FreeMode, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { discoveryClubsDetailHeroSectionLightboxStyles as styles } from "./DiscoveryClubsDetailHeroSectionLightbox.styles";
import type {
  DiscoveryClubsDetailHeroSectionLightboxItem,
  DiscoveryClubsDetailHeroSectionLightboxProps,
} from "./DiscoveryClubsDetailHeroSectionLightbox.types";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

function normalizeItem(
  item: string | DiscoveryClubsDetailHeroSectionLightboxItem,
): DiscoveryClubsDetailHeroSectionLightboxItem {
  return typeof item === "string" ? { url: item } : item;
}

export function DiscoveryClubsDetailHeroSectionLightbox({
  isOpen,
  onOpenChange,
  images,
  activeIndex,
  onSelectImage,
  title,
  labels,
  isFavorite = false,
  onFavoritePress,
}: DiscoveryClubsDetailHeroSectionLightboxProps) {
  const t = useTranslations("ClubDetail");
  const reduceMotion = useReducedMotion();
  const [favorite, setFavorite] = useState(isFavorite);
  const mainSwiperRef = useRef<SwiperInstance | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperInstance | null>(null);

  useEffect(() => {
    setFavorite(isFavorite);
  }, [isFavorite]);

  const gallery =
    images.length > 0
      ? images.map(normalizeItem)
      : [{ url: PLACEHOLDER_IMAGE }];
  const safeIndex = Math.min(
    Math.max(activeIndex, 0),
    Math.max(gallery.length - 1, 0),
  );
  const active = gallery[safeIndex] ?? gallery[0]!;
  const imageCount = gallery.length;
  const hasCaption = Boolean(active.title || active.description);
  const canNavigate = imageCount > 1;
  const headerTitle = title ?? labels?.title ?? t("galleryTitle");
  const closeLabel = labels?.close ?? t("closeGallery");
  const favoriteLabel = labels?.favorite ?? t("favorite");
  const prevLabel = labels?.prev ?? t("galleryPrev");
  const nextLabel = labels?.next ?? t("galleryNext");
  const selectImageLabel =
    labels?.selectImage ??
    ((index: number) => t("selectImage", { index }));

  const loadedSlides = useSwiperLazyLoad(safeIndex, imageCount, {
    loadAll: reduceMotion === true || imageCount <= 2,
    preloadAdjacent: 1,
  });
  const loadedThumbs = useSwiperLazyLoad(safeIndex, imageCount, {
    loadAll: reduceMotion === true || imageCount <= 4,
    preloadAdjacent: 2,
  });

  const applyTween = useSwiperSlideTween({
    disabled: reduceMotion === true,
    minScale: 0.96,
    minOpacity: 0.85,
  });

  useEffect(() => {
    if (!isOpen || !mainSwiperRef.current) return;
    if (mainSwiperRef.current.realIndex !== safeIndex) {
      mainSwiperRef.current.slideToLoop(safeIndex);
    }
  }, [isOpen, safeIndex]);

  const goBy = (delta: number) => {
    if (!canNavigate || !mainSwiperRef.current) return;
    if (delta < 0) mainSwiperRef.current.slidePrev();
    else mainSwiperRef.current.slideNext();
  };

  const handleFavorite = () => {
    setFavorite((prev) => {
      const next = !prev;
      onFavoritePress?.();
      return next;
    });
  };

  const mainOptions = swiperOptions({
    loop: imageCount > 1,
    initialSlide: safeIndex,
    speed: reduceMotion ? SWIPER_SPEED.instant : SWIPER_SPEED.juicy,
    watchSlidesProgress: !reduceMotion,
  });

  const thumbsOptions = swiperFreeOptions({
    spaceBetween: 10,
    speed: reduceMotion ? SWIPER_SPEED.instant : SWIPER_SPEED.smooth,
    watchSlidesProgress: true,
  });

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
      <Modal.Container className="p-0" size="full">
        <Modal.Dialog className={styles.dialog()}>
          <div className={styles.root()}>
            <div className={styles.header()}>
              <div className={styles.headerSide()}>
                <Button
                  aria-label={closeLabel}
                  isIconOnly
                  onPress={() => onOpenChange(false)}
                  size="lg"
                  variant="ghost"
                >
                  <ChevronLeft size={22} />
                </Button>
              </div>

              <Typography
                className={styles.headerTitle()}
                type="body"
                weight="semibold"
              >
                {`${headerTitle} (${imageCount})`}
              </Typography>

              <div className={styles.headerSide()}>
                <Button
                  aria-label={favoriteLabel}
                  aria-pressed={favorite}
                  className={styles.favorite()}
                  isIconOnly
                  onPress={handleFavorite}
                  size="lg"
                  variant="ghost"
                >
                  <Heart
                    className={favorite ? "text-danger" : undefined}
                    size={22}
                  />
                </Button>
              </div>
            </div>

            <div className={styles.stageWrap()}>
              <Swiper
                {...mainOptions}
                dir="rtl"
                aria-label={headerTitle}
                aria-roledescription="carousel"
                className={styles.viewport()}
                modules={[Thumbs]}
                onSetTranslate={applyTween}
                onSlideChange={(swiper) => onSelectImage(swiper.realIndex)}
                onSwiper={(swiper) => {
                  mainSwiperRef.current = swiper;
                  applyTween(swiper);
                }}
                thumbs={{
                  swiper:
                    thumbsSwiper && !thumbsSwiper.destroyed
                      ? thumbsSwiper
                      : null,
                }}
              >
                {gallery.map((image, index) => {
                  const canLoad = loadedSlides.has(index);
                  return (
                    <SwiperSlide
                      className={styles.slide()}
                      key={`${image.url}-${index}`}
                    >
                      <div
                        className={styles.slideInner()}
                        data-swiper-tween=""
                      >
                        {canLoad ? (
                          <Image
                            alt={image.title ?? headerTitle}
                            className={styles.image()}
                            draggable={false}
                            height={1600}
                            priority={index === safeIndex}
                            sizes="100vw"
                            src={image.url || PLACEHOLDER_IMAGE}
                            width={1200}
                          />
                        ) : (
                          <div
                            aria-hidden
                            className={styles.imagePlaceholder()}
                          />
                        )}
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              {hasCaption ? (
                <div className={styles.caption()}>
                  {active.title ? (
                    <Typography
                      className={styles.captionTitle()}
                      type="h4"
                      weight="semibold"
                    >
                      {active.title}
                    </Typography>
                  ) : null}
                  {active.description ? (
                    <Typography
                      className={styles.captionBody()}
                      type="body-sm"
                    >
                      {active.description}
                    </Typography>
                  ) : null}
                </div>
              ) : null}

              {canNavigate ? (
                <>
                  <div className={styles.navPrev()}>
                    <Button
                      aria-label={prevLabel}
                      className={styles.navButton()}
                      isIconOnly
                      onPress={() => goBy(-1)}
                      size="lg"
                      variant="ghost"
                    >
                      <ChevronRight rtlMirror={false} size={20} />
                    </Button>
                  </div>

                  <div className={styles.navNext()}>
                    <Button
                      aria-label={nextLabel}
                      className={styles.navButton()}
                      isIconOnly
                      onPress={() => goBy(1)}
                      size="lg"
                      variant="ghost"
                    >
                      <ChevronLeft rtlMirror={false} size={20} />
                    </Button>
                  </div>

                  <div aria-hidden className={styles.dots()}>
                    {gallery.map((image, index) => (
                      <span
                        className={[
                          styles.dot(),
                          index === safeIndex ? styles.dotActive() : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={`${image.url}-dot-${index}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <Swiper
              {...thumbsOptions}
              dir="rtl"
              className={styles.thumbsViewport()}
              modules={[FreeMode, Thumbs]}
              onSwiper={setThumbsSwiper}
            >
              {gallery.map((image, index) => {
                const isActive = index === safeIndex;
                const canLoadThumb = loadedThumbs.has(index);
                return (
                  <SwiperSlide
                    className={styles.thumbSlide()}
                    key={`${image.url}-thumb-${index}`}
                  >
                    <Button
                      aria-current={isActive ? "true" : undefined}
                      aria-label={
                        image.title ?? selectImageLabel(index + 1)
                      }
                      className={[
                        styles.thumbButton(),
                        isActive
                          ? styles.thumbActive()
                          : styles.thumbIdle(),
                      ].join(" ")}
                      isIconOnly
                      onPress={() => mainSwiperRef.current?.slideToLoop(index)}
                      size="lg"
                      variant="ghost"
                    >
                      {canLoadThumb ? (
                        <Image
                          alt={image.title ?? ""}
                          className={styles.thumbImage()}
                          draggable={false}
                          height={64}
                          sizes="64px"
                          src={image.url || PLACEHOLDER_IMAGE}
                          width={64}
                        />
                      ) : (
                        <div
                          aria-hidden
                          className={styles.thumbPlaceholder()}
                        />
                      )}
                    </Button>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
