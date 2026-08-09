"use client";

import { Button, Typography } from "@heroui/react";
import { ArrowUpRight } from "@repo/icons/ArrowUpRight";
import { Image1 } from "@repo/icons/Image1";
import { ClubGalleryCard } from "@repo/ui/cards/ClubGalleryCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import { CarouselNavigation } from "@repo/ui/kit/CarouselNavigation";
import useEmblaCarousel from "embla-carousel-react";
import { useState, type ReactNode } from "react";
import {
  formatGalleryViews,
  isGalleryItemNew,
} from "../../lib/gallery-media";
import { DiscoveryClubsDetailHeroSectionLightbox } from "../DiscoveryClubsDetailHeroSectionLightbox";
import { discoveryGallerySectionStyles as styles } from "./DiscoveryGallerySection.styles";
import type { DiscoveryGallerySectionProps } from "./DiscoveryGallerySection.types";

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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    direction: "rtl",
    dragFree: true,
  });

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
        <CarouselNavigation emblaApi={emblaApi} size="sm" />
      </div>

      <div
        aria-label={labels.title}
        aria-roledescription="carousel"
        className={styles.carousel}
        ref={emblaRef}
      >
        <div className={styles.carouselTrack}>
          {preview.map((item, index) => (
            <div
              className={styles.slide}
              key={item.id ?? `${item.url}-${index}`}
            >
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
          ))}

          <Button
            className={styles.seeAll}
            onPress={() => openLightbox(0)}
            variant="secondary"
          >
            <ArrowUpRight size={20} />
            <span className={styles.seeAllLabel}>{labels.seeAll}</span>
          </Button>
        </div>
      </div>

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
