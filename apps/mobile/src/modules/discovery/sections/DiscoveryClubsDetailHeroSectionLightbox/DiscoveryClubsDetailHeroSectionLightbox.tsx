"use client";

import { Button, Modal, Typography } from "@heroui/react";
import { CloseX } from "@repo/icons/CloseX";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { discoveryClubsDetailHeroSectionLightboxStyles as styles } from "./DiscoveryClubsDetailHeroSectionLightbox.styles";
import type { DiscoveryClubsDetailHeroSectionLightboxProps } from "./DiscoveryClubsDetailHeroSectionLightbox.types";

export function DiscoveryClubsDetailHeroSectionLightbox({
  isOpen,
  onOpenChange,
  images,
  activeIndex,
  onSelectImage,
}: DiscoveryClubsDetailHeroSectionLightboxProps) {
  const t = useTranslations("ClubDetail");
  const gallery = images.length > 0 ? images : [PLACEHOLDER_IMAGE];
  const activeImage = gallery[activeIndex] ?? gallery[0] ?? PLACEHOLDER_IMAGE;
  const imageCount = gallery.length;

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
      <Modal.Container className="p-0" size="full">
        <Modal.Dialog className={styles.dialog}>
          <div className={styles.root}>
            <div className={styles.header}>
              <Typography
                className={styles.count}
                type="body-sm"
                weight="medium"
              >
                {t("galleryCount", {
                  current: activeIndex + 1,
                  total: imageCount,
                })}
              </Typography>
              <Button
                aria-label={t("closeGallery")}
                isIconOnly
                onPress={() => onOpenChange(false)}
                size="lg"
                variant="tertiary"
              >
                <CloseX size={20} />
              </Button>
            </div>

            <div className={styles.stage}>
              <Image
                alt=""
                className={styles.image}
                draggable={false}
                fill
                sizes="100vw"
                src={activeImage}
              />
            </div>

            <div className={styles.thumbs}>
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
                    onPress={() => onSelectImage(index)}
                    size="lg"
                    variant="ghost"
                  >
                    <Image
                      alt=""
                      className={styles.thumbImage}
                      draggable={false}
                      fill
                      sizes="56px"
                      src={image || PLACEHOLDER_IMAGE}
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
