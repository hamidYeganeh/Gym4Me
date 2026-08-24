"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { ChevronRight } from "@repo/icons/ChevronRight";
import { Image1 } from "@repo/icons/Image1";
import Image from "next/image";
import { seoClubDetailGallerySectionStyles as styles } from "./SeoClubDetailGallerySection.styles";
import type { SeoClubDetailGallerySectionProps } from "./SeoClubDetailGallerySection.types";

export function SeoClubDetailGallerySection({
  items,
  clubName,
}: SeoClubDetailGallerySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) {
    return (
      <section aria-label="گالری باشگاه" className={styles.emptyRoot}>
        <Image1 aria-hidden size={34} />
        <p>هنوز تصویری برای این باشگاه ثبت نشده است.</p>
      </section>
    );
  }

  const active = items[activeIndex] ?? items[0]!;
  const selectRelative = (offset: number) => {
    setActiveIndex(
      (current) => (current + offset + items.length) % items.length,
    );
  };

  return (
    <section aria-label="گالری باشگاه" className={styles.root}>
      <div className={styles.hero}>
        <Image
          alt={active.title ?? `${clubName} — تصویر ${activeIndex + 1}`}
          className={styles.image}
          fill
          priority
          sizes="100vw"
          src={active.url}
        />
        <div aria-hidden className={styles.scrim} />
        <Chip className={styles.counter} size="sm">
          <Chip.Label>
            {activeIndex + 1} از {items.length}
          </Chip.Label>
        </Chip>
        {items.length > 1 ? (
          <div className={styles.controls}>
            <Button
              aria-label="تصویر قبلی"
              className={styles.control}
              isIconOnly
              size="sm"
              variant="tertiary"
              onPress={() => selectRelative(-1)}
            >
              <ChevronRight size={18} />
            </Button>
            <Button
              aria-label="تصویر بعدی"
              className={styles.control}
              isIconOnly
              size="sm"
              variant="tertiary"
              onPress={() => selectRelative(1)}
            >
              <ChevronLeft size={18} />
            </Button>
          </div>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className={styles.thumbnails}>
          {items.map((item, index) => (
            <button
              aria-label={`نمایش تصویر ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={styles.thumbnail}
              data-active={index === activeIndex || undefined}
              key={`${item.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
            >
              <Image
                alt=""
                className={styles.thumbnailImage}
                fill
                sizes="96px"
                src={item.url}
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
