"use client";

import { Button, Modal, Typography } from "@heroui/react";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { Heart } from "@repo/icons/Heart";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  const activeImage = active.url || PLACEHOLDER_IMAGE;
  const imageCount = gallery.length;
  const hasCaption = Boolean(active.title || active.description);
  const canNavigate = imageCount > 1;

  const goBy = (delta: number) => {
    if (!canNavigate) return;
    const next = (safeIndex + delta + imageCount) % imageCount;
    onSelectImage(next);
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
                  aria-label={t("closeGallery")}
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
                {title ?? t("galleryTitle")}
              </Typography>

              <div className={styles.headerSide()} aria-hidden />
            </div>

            <div className={styles.stageWrap()}>
              <div className={styles.stage()}>
                <Image
                  alt={active.title ?? title ?? t("galleryTitle")}
                  className={styles.image()}
                  draggable={false}
                  fill
                  priority
                  sizes="100vw"
                  src={activeImage}
                />

                <Button
                  aria-label={t("favorite")}
                  aria-pressed={favorite}
                  className={styles.favorite()}
                  isIconOnly
                  onPress={handleFavorite}
                  size="lg"
                  variant="tertiary"
                >
                  <Heart
                    className={favorite ? "text-danger" : undefined}
                    size={22}
                  />
                </Button>

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
                  <div className={styles.controls()}>
                    <Button
                      aria-label={t("galleryPrev")}
                      className={styles.navButton()}
                      isIconOnly
                      onPress={() => goBy(-1)}
                      size="lg"
                      variant="primary"
                    >
                      <ChevronRight size={20} />
                    </Button>

                    <div
                      aria-hidden
                      className={styles.dots()}
                    >
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

                    <Button
                      aria-label={t("galleryNext")}
                      className={styles.navButton()}
                      isIconOnly
                      onPress={() => goBy(1)}
                      size="lg"
                      variant="primary"
                    >
                      <ChevronLeft size={20} />
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className={styles.thumbs()}>
              {gallery.map((image, index) => {
                const isActive = index === safeIndex;
                return (
                  <Button
                    aria-current={isActive ? "true" : undefined}
                    aria-label={
                      image.title ?? t("selectImage", { index: index + 1 })
                    }
                    className={[
                      styles.thumbButton(),
                      isActive ? styles.thumbActive() : styles.thumbIdle(),
                    ].join(" ")}
                    isIconOnly
                    key={`${image.url}-${index}`}
                    onPress={() => onSelectImage(index)}
                    size="lg"
                    variant="ghost"
                  >
                    <Image
                      alt={image.title ?? ""}
                      className={styles.thumbImage()}
                      draggable={false}
                      fill
                      sizes="72px"
                      src={image.url || PLACEHOLDER_IMAGE}
                    />
                  </Button>
                );
              })}
            </div>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
