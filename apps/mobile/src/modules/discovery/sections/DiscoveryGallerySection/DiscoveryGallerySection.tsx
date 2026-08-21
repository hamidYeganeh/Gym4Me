"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { Image1 } from "@repo/icons/Image1";
import { ClubGalleryCard } from "@repo/ui/cards/ClubGalleryCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { swiperFreeOptions } from "@repo/ui/lib/swiper";
import { useState, type ReactNode } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  formatGalleryViews,
  isGalleryItemNew,
} from "../../lib/gallery-media";
import { DiscoveryClubsDetailHeroSectionLightbox } from "../DiscoveryClubsDetailHeroSectionLightbox";
import { discoveryGallerySectionStyles as styles } from "./DiscoveryGallerySection.styles";
import type { DiscoveryGallerySectionProps } from "./DiscoveryGallerySection.types";

import "swiper/css";
import "swiper/css/free-mode";

const GALLERY_PREVIEW_COUNT = 8;
const SECTION_TITLE_ICON_SIZE = 20;

function SectionTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className={styles.sectionTitleRow}>
      {icon ? (
        <span aria-hidden className={styles.sectionTitleIcon}>
          {icon}
        </span>
      ) : null}
      <Typography className={styles.sectionTitle} type="h4" weight="semibold">
        {children}
      </Typography>
    </div>
  );
}

export function DiscoveryGallerySection({
  gallery,
  labels,
  className,
}: DiscoveryGallerySectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (gallery.length === 0) return null;

  const preview = gallery.slice(0, GALLERY_PREVIEW_COUNT);
  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.sectionHeader}>
        <SectionTitle icon={<Image1 size={SECTION_TITLE_ICON_SIZE} />}>
          {labels.title}
        </SectionTitle>
      </div>

      <Swiper
        {...swiperFreeOptions()} dir="rtl"
        aria-label={labels.title}
        aria-roledescription="carousel"
        className={styles.carousel}
        modules={[FreeMode]}
      >
        {preview.map((item, index) => (
          <SwiperSlide className={styles.swiperSlide} key={item.id ?? `${item.url}-${index}`}>
            <div className={styles.slide}>
              <ClubGalleryCard
                actionLabel={labels.action}
                author={item.author}
                durationLabel={item.durationLabel}
                image={item.url || PLACEHOLDER_IMAGE}
                imageAlt={item.title ?? labels.title}
                isNew={isGalleryItemNew(item.createdAt)}
                mediaKind={item.mediaKind ?? "image"}
                newLabel={labels.newBadge}
                onPress={() => openLightbox(index)}
                title={item.title ?? labels.title}
                viewsLabel={
                  item.views != null
                    ? formatGalleryViews(item.views)
                    : undefined
                }
              />
            </div>
          </SwiperSlide>
        ))}

        <SwiperSlide className={styles.swiperSlide}>
          <Button
            className={styles.seeAll}
            onPress={() => openLightbox(0)}
            variant="secondary"
          >
            <ArrowUpRight size={20} />
            <span className={styles.seeAllLabel}>{labels.seeAll}</span>
          </Button>
        </SwiperSlide>
      </Swiper>

      <DiscoveryClubsDetailHeroSectionLightbox
        activeIndex={activeIndex}
        images={gallery}
        isOpen={lightboxOpen}
        labels={{
          close: labels.close,
          favorite: labels.favorite,
          prev: labels.prev,
          next: labels.next,
          selectImage: labels.selectImage,
          title: labels.title,
        }}
        onOpenChange={setLightboxOpen}
        onSelectImage={setActiveIndex}
        title={labels.title}
      />
    </div>
  );
}
