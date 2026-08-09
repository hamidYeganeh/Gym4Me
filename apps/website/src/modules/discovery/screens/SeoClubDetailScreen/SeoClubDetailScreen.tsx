import { Typography } from "@heroui/react";
import { mediaFileUrl } from "@/shared/lib/api";
import { SeoClubDetailGallerySection } from "../../sections/SeoClubDetailGallerySection";
import { seoClubDetailScreenStyles as styles } from "./SeoClubDetailScreen.styles";
import type { SeoClubDetailScreenProps } from "./SeoClubDetailScreen.types";

function resolveGallery(club: SeoClubDetailScreenProps["club"]) {
  const items: { url: string; title?: string; description?: string }[] = [];
  const cover = mediaFileUrl(club.identity.coverMediaId);
  if (cover) {
    items.push({ url: cover, title: club.identity.name });
  }
  for (const item of club.gallery ?? []) {
    const url = mediaFileUrl(item.mediaId);
    if (!url) continue;
    items.push({
      url,
      title: item.title ?? undefined,
      description: item.description ?? undefined,
    });
  }
  return items;
}

export function SeoClubDetailScreen({ club }: SeoClubDetailScreenProps) {
  const location =
    club.location?.address ??
    "موقعیت اعلام نشده";
  const gallery = resolveGallery(club);

  return (
    <main className={styles.root}>
      <article className={styles.article}>
        <p className={styles.eyebrow}>باشگاه</p>
        <Typography className={styles.title} type="h1" weight="bold">
          {club.identity.name}
        </Typography>
        <Typography className={styles.meta} type="body">
          {location}
        </Typography>
        {club.identity.description ? (
          <Typography className={styles.body} type="body">
            {club.identity.description}
          </Typography>
        ) : null}
        <dl className={styles.stats}>
          <div>
            <dt>امتیاز</dt>
            <dd>{club.reviewsSummary.average.toFixed(1)}</dd>
          </div>
          <div>
            <dt>نظرات</dt>
            <dd>{club.reviewsSummary.count}</dd>
          </div>
          <div>
            <dt>پذیرش</dt>
            <dd>{club.audience?.genderPolicy ?? "—"}</dd>
          </div>
        </dl>

        <SeoClubDetailGallerySection
          clubName={club.identity.name}
          items={gallery}
        />
      </article>
    </main>
  );
}
