import { notFound } from "next/navigation";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { JsonLd } from "@/shared/components/JsonLd";
import { discoveryCoaches, mediaFileUrl } from "@/shared/lib/api";
import { seoCoachDetailScreenStyles as styles } from "./SeoCoachDetailScreen.styles";
import type { SeoCoachDetailScreenProps } from "./SeoCoachDetailScreen.types";

type CoachDetail = Awaited<ReturnType<typeof discoveryCoaches.get>>;

function displayName(coach: CoachDetail) {
  return (
    [coach.user.name.first, coach.user.name.last].filter(Boolean).join(" ") ||
    "مربی"
  );
}

export async function SeoCoachDetailScreen({
  coachId,
}: SeoCoachDetailScreenProps) {
  let coach: CoachDetail;

  try {
    coach = await discoveryCoaches.get(coachId);
  } catch {
    notFound();
  }

  const name = displayName(coach);
  const image = mediaFileUrl(coach.user.avatar.mediaId) ?? undefined;
  const reviewedAt = coach.verification.reviewedAt
    ? new Date(coach.verification.reviewedAt).toLocaleDateString("fa-IR")
    : null;

  return (
    <>
      <PublicSiteHeader />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name,
          description: coach.bio ?? coach.experience.headline ?? undefined,
          image,
          jobTitle: "Coach",
          url: `/coaches/${coach.userId}`,
          worksFor: (coach.clubs ?? []).map((club) => ({
            "@type": "SportsActivityLocation",
            name: club.name,
            url: `/clubs/${club.id}`,
          })),
        }}
      />
      <main className={styles.root}>
        <article className={styles.article}>
          <p className={styles.eyebrow}>مربی</p>
          <h1 className={styles.title}>{name}</h1>
          <p className={styles.meta}>
            {coach.experience.headline ??
              coach.specialtyKeys[0] ??
              "مربی ورزشی"}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-success/10 px-3 py-1 text-success">
              هویت و سابقه تأییدشده
            </span>
            <span className="rounded-full bg-default px-3 py-1 text-muted">
              بروزرسانی {new Date(coach.updatedAt).toLocaleDateString("fa-IR")}
            </span>
          </div>
          {coach.bio ? <p className={styles.body}>{coach.bio}</p> : null}
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
          <section className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold">نوع جلسه و قیمت</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-default p-4">
                <dt className="text-sm text-muted">حضوری</dt>
                <dd className="mt-1 font-semibold">
                  {coach.pricing.consultation.inPerson === null
                    ? "ارائه نمی‌شود"
                    : `${coach.pricing.consultation.inPerson.toLocaleString("fa-IR")} تومان`}
                </dd>
              </div>
              <div className="rounded-2xl bg-default p-4">
                <dt className="text-sm text-muted">آنلاین</dt>
                <dd className="mt-1 font-semibold">
                  {coach.pricing.consultation.remote === null
                    ? "ارائه نمی‌شود"
                    : `${coach.pricing.consultation.remote.toLocaleString("fa-IR")} تومان`}
                </dd>
              </div>
            </dl>
          </section>
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
      <PublicSiteFooter />
    </>
  );
}
