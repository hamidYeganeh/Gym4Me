"use client";

import { Button, Modal, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { Heart } from "@repo/icons/Heart";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { discoveryClubsDetailHeroSectionLightboxStyles as styles } from "./DiscoveryClubsDetailHeroSectionLightbox.styles";
import type {
  DiscoveryClubsDetailHeroSectionLightboxItem,
  DiscoveryClubsDetailHeroSectionLightboxProps,
} from "./DiscoveryClubsDetailHeroSectionLightbox.types";

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
  const [favorite, setFavorite] = useState(isFavorite);

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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    direction: "rtl",
    loop: imageCount > 1,
    startIndex: safeIndex,
  });

  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    align: "start",
    containScroll: "keepSnaps",
    direction: "rtl",
    dragFree: true,
  });

  const syncFromEmbla = useCallback(() => {
    if (!emblaApi) return;
    onSelectImage(emblaApi.selectedScrollSnap());
  }, [emblaApi, onSelectImage]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", syncFromEmbla);
    emblaApi.on("reInit", syncFromEmbla);
    return () => {
      emblaApi.off("select", syncFromEmbla);
      emblaApi.off("reInit", syncFromEmbla);
    };
  }, [emblaApi, syncFromEmbla]);

  useEffect(() => {
    if (!isOpen || !emblaApi) return;
    emblaApi.reInit();
  }, [isOpen, emblaApi, gallery.length]);

  useEffect(() => {
    if (!isOpen || !emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== safeIndex) {
      emblaApi.scrollTo(safeIndex);
    }
  }, [isOpen, emblaApi, safeIndex]);

  useEffect(() => {
    if (!thumbsApi) return;
    thumbsApi.scrollTo(safeIndex);
  }, [thumbsApi, safeIndex]);

  const goBy = (delta: number) => {
    if (!canNavigate || !emblaApi) return;
    if (delta < 0) emblaApi.scrollPrev();
    else emblaApi.scrollNext();
  };

  const handleFavorite = () => {
    setFavorite((prev) => {
      const next = !prev;
      onFavoritePress?.();
      return next;
    });
  };

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
              <div
                aria-label={headerTitle}
                aria-roledescription="carousel"
                className={styles.viewport()}
                ref={emblaRef}
              >
                <div className={styles.track()}>
                  {gallery.map((image, index) => (
                    <div
                      className={styles.slide()}
                      key={`${image.url}-${index}`}
                    >
                      <div className={styles.slideInner()}>
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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

            <div className={styles.thumbsViewport()} ref={thumbsRef}>
              <div className={styles.thumbsTrack()}>
                {gallery.map((image, index) => {
                  const isActive = index === safeIndex;
                  return (
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
                      key={`${image.url}-thumb-${index}`}
                      onPress={() => emblaApi?.scrollTo(index)}
                      size="lg"
                      variant="ghost"
                    >
                      <Image
                        alt={image.title ?? ""}
                        className={styles.thumbImage()}
                        draggable={false}
                        height={64}
                        sizes="64px"
                        src={image.url || PLACEHOLDER_IMAGE}
                        width={64}
                      />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
