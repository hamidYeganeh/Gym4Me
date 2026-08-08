import { Typography } from "@heroui/react";
import { seoCoachDetailScreenStyles as styles } from "./SeoCoachDetailScreen.styles";
import type { SeoCoachDetailScreenProps } from "./SeoCoachDetailScreen.types";

function displayName(coach: SeoCoachDetailScreenProps["coach"]) {
  return (
    [coach.user.name.first, coach.user.name.last].filter(Boolean).join(" ") ||
    "مربی"
  );
}

export function SeoCoachDetailScreen({ coach }: SeoCoachDetailScreenProps) {
  const reviewedAt = coach.verification.reviewedAt
    ? new Date(coach.verification.reviewedAt).toLocaleDateString("fa-IR")
    : null;

  return (
    <main className={styles.root}>
      <article className={styles.article}>
        <p className={styles.eyebrow}>مربی</p>
        <Typography className={styles.title} type="h1" weight="bold">
          {displayName(coach)}
        </Typography>
        <Typography className={styles.meta} type="body">
          {coach.experience.headline ?? coach.specialtyKeys[0] ?? "مربی ورزشی"}
        </Typography>
        {coach.bio ? (
          <Typography className={styles.body} type="body">
            {coach.bio}
          </Typography>
        ) : null}
        <dl className={styles.stats}>
          <div>
            <dt>تأیید</dt>
            <dd>
              {coach.verification.status === "approved"
                ? reviewedAt
                  ? `تأییدشده · ${reviewedAt}`
                  : "تأییدشده"
                : coach.verification.status}
            </dd>
          </div>
          <div>
            <dt>سابقه</dt>
            <dd>{coach.experience.years ?? "—"} سال</dd>
          </div>
          <div>
            <dt>باشگاه‌ها</dt>
            <dd>{coach.clubs?.length ?? 0}</dd>
          </div>
        </dl>
        {coach.clubs && coach.clubs.length > 0 ? (
          <ul className={styles.clubs}>
            {coach.clubs.map((club) => (
              <li key={club.id}>
                <a href={`/clubs/${club.id}`}>{club.name}</a>
                {club.address ? (
                  <span className={styles.clubMeta}>{club.address}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </main>
  );
}
