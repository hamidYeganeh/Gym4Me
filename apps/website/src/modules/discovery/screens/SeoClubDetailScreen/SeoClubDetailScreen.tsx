import { notFound } from "next/navigation";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { JsonLd } from "@/shared/components/JsonLd";
import { discoveryClubs, mediaFileUrl, membershipsApi } from "@/shared/lib/api";
import { SeoClubDetailGallerySection } from "../../sections/SeoClubDetailGallerySection";
import { seoClubDetailScreenStyles as styles } from "./SeoClubDetailScreen.styles";
import type { SeoClubDetailScreenProps } from "./SeoClubDetailScreen.types";

type ClubDetail = Awaited<ReturnType<typeof discoveryClubs.get>>;

function resolveGallery(club: ClubDetail) {
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

export async function SeoClubDetailScreen({ clubId }: SeoClubDetailScreenProps) {
  try {
    const [club, reviewsPage, plansPage] = await Promise.all([
      discoveryClubs.get(clubId),
      discoveryClubs.listReviews(clubId, { page_size: 10 }).catch(() => null),
      membershipsApi
        .listPublicClubPlans(clubId, { page_size: 20 })
        .catch(() => null),
    ]);
    const reviews = reviewsPage?.result ?? [];
    const plans = plansPage?.result ?? [];
    const location = club.location?.address ?? "موقعیت اعلام نشده";
    const gallery = resolveGallery(club);
    const image =
      mediaFileUrl(club.identity.coverMediaId) ??
      mediaFileUrl(club.gallery[0]?.mediaId) ??
      undefined;

    return (
      <>
        <PublicSiteHeader />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            name: club.identity.name,
            description: club.identity.description ?? undefined,
            image,
            address: club.location?.address
              ? {
                  "@type": "PostalAddress",
                  streetAddress: club.location.address,
                }
              : undefined,
            geo: club.location?.point
              ? {
                  "@type": "GeoCoordinates",
                  latitude: club.location.point.lat,
                  longitude: club.location.point.lng,
                }
              : undefined,
            aggregateRating:
              club.reviewsSummary.count > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: club.reviewsSummary.average,
                    reviewCount: club.reviewsSummary.count,
                  }
                : undefined,
            url: `/clubs/${club.id}`,
          }}
        />
        <main className={styles.root}>
          <article className={styles.article}>
            <p className={styles.eyebrow}>باشگاه</p>
            <h1 className={styles.title}>{club.identity.name}</h1>
            <p className={styles.meta}>{location}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-success/10 px-3 py-1 text-success">
                مجموعه تأییدشده
              </span>
              <span className="rounded-full bg-default px-3 py-1 text-muted">
                بروزرسانی {new Date(club.updatedAt).toLocaleDateString("fa-IR")}
              </span>
              <span className="rounded-full bg-default px-3 py-1 text-muted">
                {club.reviewsSummary.count} نظر تأییدشده
              </span>
            </div>
            {club.identity.description ? (
              <p className={styles.body}>{club.identity.description}</p>
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

            {club.reviewsSummary.criteria.length > 0 ? (
              <section className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold">جزئیات امتیاز کاربران</h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {club.reviewsSummary.criteria.map((criterion) => (
                    <div
                      className="rounded-2xl bg-default p-4"
                      key={criterion.criterionId}
                    >
                      <dt className="text-sm text-muted">
                        {criterion.criterionId}
                      </dt>
                      <dd className="mt-1 font-semibold">
                        {criterion.average.toFixed(1)} از ۵
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {plans.length > 0 ? (
              <section className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold">بسته‌های عضویت فعال</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {plans.map((plan) => (
                    <li
                      className="rounded-2xl border border-border p-4"
                      key={plan.id}
                    >
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="mt-2 text-sm text-muted">
                        {plan.pricing.amount.toLocaleString("fa-IR")} تومان
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {club.cancellation.rules.length > 0 ? (
              <section className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold">قواعد لغو و بازپرداخت</h2>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
                  {club.cancellation.rules.map((rule) => (
                    <li key={`${rule.hoursBeforeReservation}-${rule.feePercent}`}>
                      {rule.title}: تا{" "}
                      {rule.hoursBeforeReservation.toLocaleString("fa-IR")} ساعت
                      قبل، جریمه {rule.feePercent.toLocaleString("fa-IR")}٪
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {reviews.length > 0 ? (
              <section className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold">نظر اعضای تأییدشده</h2>
                <ul className="mt-4 space-y-3">
                  {reviews.map((review) => (
                    <li className="rounded-2xl bg-default p-4" key={review.id}>
                      <div className="flex justify-between gap-3 text-sm">
                        <strong>عضو باشگاه</strong>
                        <span>★ {review.rating.toLocaleString("fa-IR")}</span>
                      </div>
                      {review.comment ? (
                        <p className="mt-2 text-sm leading-7 text-muted">
                          {review.comment}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted">
                        {new Date(review.createdAt).toLocaleDateString("fa-IR")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </article>
        </main>
        <PublicSiteFooter />
      </>
    );
  } catch {
    notFound();
  }
}
