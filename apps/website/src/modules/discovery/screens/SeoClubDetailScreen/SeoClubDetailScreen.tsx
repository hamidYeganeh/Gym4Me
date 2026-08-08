import { Typography } from "@heroui/react";
import { seoClubDetailScreenStyles as styles } from "./SeoClubDetailScreen.styles";
import type { SeoClubDetailScreenProps } from "./SeoClubDetailScreen.types";

export function SeoClubDetailScreen({ club }: SeoClubDetailScreenProps) {
  const location =
    club.location?.address ??
    "موقعیت اعلام نشده";

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
      </article>
    </main>
  );
}
