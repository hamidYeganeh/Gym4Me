import type { ReactNode } from "react";
import { Chip } from "@heroui/react/chip";
import { AcademicCap } from "@repo/icons/AcademicCap";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { CheckCircle } from "@repo/icons/CheckCircle";
import { Clock } from "@repo/icons/Clock";
import { MapPin1 } from "@repo/icons/MapPin1";
import { ShieldCheck } from "@repo/icons/ShieldCheck";
import { Sparkle1 } from "@repo/icons/Sparkle1";
import { StarFull } from "@repo/icons/StarFull";
import { Target1 } from "@repo/icons/Target1";
import { Telephone1 } from "@repo/icons/Telephone1";
import { UsersThree } from "@repo/icons/UsersThree";
import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import Link from "next/link";
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
type ClubReview = NonNullable<
  Awaited<ReturnType<typeof discoveryClubs.listReviews>>
>["result"][number];
type ClubPlan = NonNullable<
  Awaited<ReturnType<typeof membershipsApi.listPublicClubPlans>>
>["result"][number];

const WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

function resolveGallery(club: ClubDetail) {
  const items: { url: string; title?: string; description?: string }[] = [];
  const cover = mediaFileUrl(club.identity.coverMediaId);
  if (cover) items.push({ url: cover, title: club.identity.name });
  for (const item of club.gallery ?? []) {
    const url = mediaFileUrl(item.mediaId);
    if (!url || items.some((entry) => entry.url === url)) continue;
    items.push({
      url,
      title: item.title ?? undefined,
      description: item.description ?? undefined,
    });
  }
  return items;
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionTitleRow}>
        <span className={styles.sectionIcon}>{icon}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function itemName(item: { id: string; name?: string }) {
  return item.name?.trim() || item.id;
}

function audienceLabel(policy: string | null | undefined) {
  if (policy === "male_only") return "ویژه آقایان";
  if (policy === "female_only") return "ویژه بانوان";
  if (policy === "mixed") return "پذیرش بانوان و آقایان";
  return "شرایط پذیرش اعلام نشده";
}

function planMeta(plan: ClubPlan) {
  if (plan.kind === "duration" && plan.durationDays) {
    return `${plan.durationDays.toLocaleString("fa-IR")} روز`;
  }
  if (plan.kind === "sessions" && plan.sessionsTotal) {
    return `${plan.sessionsTotal.toLocaleString("fa-IR")} جلسه`;
  }
  if (plan.kind === "entries" && plan.entriesTotal) {
    return `${plan.entriesTotal.toLocaleString("fa-IR")} ورود`;
  }
  return "عضویت باشگاه";
}

export async function SeoClubDetailScreen({
  clubId,
}: SeoClubDetailScreenProps) {
  let club: ClubDetail;
  let reviews: ClubReview[];
  let plans: ClubPlan[];

  try {
    const [clubResult, reviewsPage, plansPage] = await Promise.all([
      discoveryClubs.get(clubId),
      discoveryClubs.listReviews(clubId, { page_size: 10 }).catch(() => null),
      membershipsApi
        .listPublicClubPlans(clubId, { page_size: 20 })
        .catch(() => null),
    ]);
    club = clubResult;
    reviews = reviewsPage?.result ?? [];
    plans = plansPage?.result ?? [];
  } catch {
    notFound();
  }

  const location = club.location?.address ?? "موقعیت اعلام نشده";
  const gallery = resolveGallery(club);
  const image = gallery[0]?.url;
  const lowestPlan = [...plans].sort(
    (a, b) => a.pricing.amount - b.pricing.amount,
  )[0];
  const phone = club.contact.phones[0]?.number;
  const ctaHref = "/#download";

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
          telephone: phone,
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
        <div className={styles.galleryWrap}>
          <SeoClubDetailGallerySection
            clubName={club.identity.name}
            items={gallery}
          />
        </div>

        <div className={styles.sheet}>
          <header className={styles.heroHeader}>
            <div className={styles.heroCopy}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{club.identity.name}</h1>
                <Chip className={styles.verifiedChip} size="sm">
                  <Chip.Label>تأییدشده</Chip.Label>
                </Chip>
              </div>
              <p className={styles.location}>
                <MapPin1 aria-hidden size={17} />
                <span>{location}</span>
              </p>
              <div className={styles.heroMeta}>
                <div className={styles.rating}>
                  <StarFull aria-hidden size={16} />
                  <strong>{club.reviewsSummary.average.toFixed(1)}</strong>
                  <span>
                    {club.reviewsSummary.count.toLocaleString("fa-IR")} نظر
                  </span>
                </div>
                <span>{audienceLabel(club.audience?.genderPolicy)}</span>
              </div>
            </div>
          </header>

          <div className={styles.layout}>
            <article className={styles.content}>
              {club.identity.description ? (
                <Section
                  icon={<AcademicCap aria-hidden size={21} />}
                  title="درباره باشگاه"
                >
                  <p className={styles.body}>{club.identity.description}</p>
                </Section>
              ) : null}

              {club.amenities.length > 0 ? (
                <Section
                  icon={<Sparkle1 aria-hidden size={21} />}
                  title="امکانات باشگاه"
                >
                  <ul className={styles.featureGrid}>
                    {club.amenities.map((item) => (
                      <li className={styles.featureCard} key={item.id}>
                        <CheckCircle aria-hidden size={20} />
                        <div>
                          <strong>{itemName(item)}</strong>
                          {item.selectionDescription ? (
                            <p>{item.selectionDescription}</p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              {club.categories.length > 0 ? (
                <Section
                  icon={<UsersThree aria-hidden size={21} />}
                  title="دسته‌بندی"
                >
                  <div className={styles.chips}>
                    {club.categories.map((item) => (
                      <Chip key={item.id} variant="secondary">
                        <Chip.Label>{itemName(item)}</Chip.Label>
                      </Chip>
                    ))}
                  </div>
                </Section>
              ) : null}

              {club.sports.length > 0 ? (
                <Section
                  icon={<Target1 aria-hidden size={21} />}
                  title="رشته‌های ورزشی"
                >
                  <ul className={styles.horizontalCards}>
                    {club.sports.map((item) => (
                      <li className={styles.sportCard} key={item.id}>
                        <Target1 aria-hidden size={24} />
                        <strong>{itemName(item)}</strong>
                        {item.selectionDescription ? (
                          <p>{item.selectionDescription}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              {club.equipments.length > 0 ? (
                <Section
                  icon={<BarbellHorizontal aria-hidden size={21} />}
                  title="تجهیزات"
                >
                  <ul className={styles.equipmentList}>
                    {club.equipments.map((item) => (
                      <li className={styles.equipmentItem} key={item.id}>
                        <span className={styles.equipmentIcon}>
                          <BarbellHorizontal aria-hidden size={21} />
                        </span>
                        <div>
                          <strong>{itemName(item)}</strong>
                          {item.selectionDescription ? (
                            <p>{item.selectionDescription}</p>
                          ) : null}
                        </div>
                        {item.quantity ? (
                          <span className={styles.quantity}>
                            {item.quantity.toLocaleString("fa-IR")} عدد
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              {club.operatingHours.length > 0 ? (
                <Section
                  icon={<Clock aria-hidden size={21} />}
                  title="ساعات کاری"
                >
                  <dl className={styles.hoursList}>
                    {club.operatingHours.map((hour, index) => (
                      <div
                        className={styles.hourRow}
                        key={`${hour.weekday}-${hour.audience ?? "shared"}-${index}`}
                      >
                        <dt>
                          {WEEKDAYS[hour.weekday] ?? `روز ${hour.weekday + 1}`}
                        </dt>
                        <dd>
                          {hour.status === "closed"
                            ? "تعطیل"
                            : `${hour.open ?? "—"} تا ${hour.close ?? "—"}`}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Section>
              ) : null}

              {club.contact.phones.length > 0 ? (
                <Section
                  icon={<Telephone1 aria-hidden size={21} />}
                  title="راه‌های تماس"
                >
                  <div className={styles.contactList}>
                    {club.contact.phones.map((item) => (
                      <a
                        className={styles.contactItem}
                        href={`tel:${item.number}`}
                        key={`${item.number}-${item.label}`}
                      >
                        <span>{item.label ?? "تماس با باشگاه"}</span>
                        <b dir="ltr">{item.number}</b>
                      </a>
                    ))}
                  </div>
                </Section>
              ) : null}

              {plans.length > 0 ? (
                <Section
                  icon={<ShieldCheck aria-hidden size={21} />}
                  title="پلن‌های عضویت"
                >
                  <ul className={styles.planGrid}>
                    {plans.map((plan, index) => (
                      <li
                        className={styles.planCard}
                        data-featured={index === 0 || undefined}
                        key={plan.id}
                      >
                        <div>
                          <strong>{plan.name}</strong>
                          <p>{plan.description ?? planMeta(plan)}</p>
                        </div>
                        <div className={styles.planPrice}>
                          <strong>
                            {plan.pricing.amount.toLocaleString("fa-IR")}
                          </strong>
                          <span>تومان</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              {club.cancellation.rules.length > 0 || club.rules.length > 0 ? (
                <Section
                  icon={<ShieldCheck aria-hidden size={21} />}
                  title="قوانین باشگاه"
                >
                  <ul className={styles.rules}>
                    {club.rules.map((rule, index) => (
                      <li key={`${rule.title}-${index}`}>
                        <strong>{rule.title}</strong>
                        {rule.description ? <p>{rule.description}</p> : null}
                      </li>
                    ))}
                    {club.cancellation.rules.map((rule) => (
                      <li
                        key={`${rule.hoursBeforeReservation}-${rule.feePercent}`}
                      >
                        <strong>{rule.title}</strong>
                        <p>
                          تا{" "}
                          {rule.hoursBeforeReservation.toLocaleString("fa-IR")}{" "}
                          ساعت قبل؛ جریمه{" "}
                          {rule.feePercent.toLocaleString("fa-IR")}٪
                        </p>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              {reviews.length > 0 ? (
                <Section
                  icon={<StarFull aria-hidden size={21} />}
                  title="نظر اعضا"
                >
                  <ul className={styles.reviewList}>
                    {reviews.map((review) => (
                      <li className={styles.reviewCard} key={review.id}>
                        <div className={styles.reviewHeader}>
                          <strong>عضو تأییدشده</strong>
                          <span>★ {review.rating.toLocaleString("fa-IR")}</span>
                        </div>
                        {review.comment ? <p>{review.comment}</p> : null}
                        <time dateTime={review.createdAt}>
                          {new Date(review.createdAt).toLocaleDateString(
                            "fa-IR",
                          )}
                        </time>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              <Section
                icon={<MapPin1 aria-hidden size={21} />}
                title="موقعیت باشگاه"
              >
                <div className={styles.locationCard}>
                  <MapPin1 aria-hidden size={24} />
                  <div>
                    <strong>{location}</strong>
                    <p>
                      <TextWithBrand>
                        برای مسیریابی و رزرو، اپ Gym4Me را باز کنید.
                      </TextWithBrand>
                    </p>
                  </div>
                </div>
              </Section>
            </article>

            <aside className={styles.aside}>
              <div className={styles.bookingCard}>
                <p className={styles.bookingEyebrow}>
                  <TextWithBrand>رزرو در Gym4Me</TextWithBrand>
                </p>
                {lowestPlan ? (
                  <div className={styles.bookingPrice}>
                    <span>شروع از</span>
                    <strong>
                      {lowestPlan.pricing.amount.toLocaleString("fa-IR")}
                    </strong>
                    <span>تومان</span>
                  </div>
                ) : (
                  <h2 className={styles.bookingTitle}>
                    برنامه‌های باشگاه را در اپ ببینید
                  </h2>
                )}
                <p className={styles.bookingHint}>
                  <TextWithBrand>
                    رزرو، پرداخت و مدیریت عضویت در اپ Gym4Me انجام می‌شود.
                  </TextWithBrand>
                </p>
                <Link className={styles.primaryCta} href={ctaHref}>
                  مشاهده در اپ
                </Link>
                {phone ? (
                  <a
                    className={styles.secondaryCta}
                    dir="ltr"
                    href={`tel:${phone}`}
                  >
                    {phone}
                  </a>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <div className={styles.mobileCta}>
        <div>
          {lowestPlan ? (
            <>
              <span>شروع از</span>
              <strong>
                {lowestPlan.pricing.amount.toLocaleString("fa-IR")} تومان
              </strong>
            </>
          ) : (
            <strong>رزرو باشگاه</strong>
          )}
        </div>
        <Link className={styles.mobileCtaButton} href={ctaHref}>
          مشاهده در اپ
        </Link>
      </div>
      <PublicSiteFooter />
    </>
  );
}
