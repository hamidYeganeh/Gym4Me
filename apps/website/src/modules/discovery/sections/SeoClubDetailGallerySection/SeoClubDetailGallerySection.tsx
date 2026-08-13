import Image from "next/image";
import { seoClubDetailGallerySectionStyles as styles } from "./SeoClubDetailGallerySection.styles";
import type { SeoClubDetailGallerySectionProps } from "./SeoClubDetailGallerySection.types";

export function SeoClubDetailGallerySection({
  items,
  clubName,
}: SeoClubDetailGallerySectionProps) {
  if (items.length === 0) {
    return (
      <section aria-label="گالری باشگاه" className={styles.root}>
        <h2 className={styles.title}>گالری باشگاه</h2>
        <p className={styles.empty}>
          هنوز رسانه‌ای برای این باشگاه ثبت نشده است.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="گالری باشگاه" className={styles.root}>
      <h2 className={styles.title}>گالری باشگاه</h2>
      <ul className={styles.grid}>
        {items.map((item, index) => {
          const alt = item.title ?? `${clubName} — تصویر ${index + 1}`;
          return (
            <li className={styles.item} key={`${item.url}-${index}`}>
              <Image
                alt={alt}
                className={styles.image}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                src={item.url}
              />
              {item.title ? (
                <div className={styles.caption}>
                  <p className={styles.captionTitle}>{item.title}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
