import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { JsonLd } from "@/shared/components/JsonLd";
import { discoveryClasses, discoveryClubSlots } from "@/shared/lib/api";
import { seoClassDetailScreenStyles as styles } from "./SeoClassDetailScreen.styles";
import type { SeoClassDetailScreenProps } from "./SeoClassDetailScreen.types";

const TEHRAN_TIMEZONE = "Asia/Tehran";

function isoDateInTehran(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TEHRAN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatJalaliDate(isoDate: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TEHRAN_TIMEZONE,
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

export async function SeoClassDetailScreen({
  classId,
}: SeoClassDetailScreenProps) {
  const t = await getTranslations("PublicClasses");
  let item: Awaited<ReturnType<typeof discoveryClasses.get>>;

  try {
    item = await discoveryClasses.get(classId);
  } catch {
    notFound();
  }

  const today = isoDateInTehran();
  const calendar = await discoveryClubSlots
    .getCalendar(item.clubId, { from: today, to: addDays(today, 29) })
    .catch(() => null);
  const occurrences =
    calendar?.days.flatMap((day) =>
      day.items
        .filter(
          (occurrence) =>
            occurrence.class?.id === item.id &&
            occurrence.occurrenceStatus !== "cancelled",
        )
        .map((occurrence) => ({ date: day.date, ...occurrence })),
    ) ?? [];

  return (
    <>
      <PublicSiteHeader />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: item.title,
          description: item.description ?? undefined,
          provider: {
            "@type": "SportsActivityLocation",
            name: item.club.name,
            url: `/clubs/${item.club.id}`,
          },
          offers: occurrences.map((occurrence) => ({
            "@type": "Offer",
            price: occurrence.price,
            priceCurrency: "IRT",
            availability:
              occurrence.remaining > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
          })),
          url: `/classes/${item.id}`,
        }}
      />
      <main className={styles.root}>
        <article className={styles.article}>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>{t("verifiedSupply")}</p>
            <h1 className={styles.title}>{item.title}</h1>
            {item.description ? (
              <p className={styles.description}>{item.description}</p>
            ) : null}
          </header>
          <div className={styles.layout}>
            <div className={styles.content}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t("schedule")}</h2>
                {occurrences.length ? (
                  <ul className={styles.schedule}>
                    {occurrences.map((occurrence) => (
                      <li
                        className={styles.occurrence}
                        key={`${occurrence.slotId}-${occurrence.date}-${occurrence.startTime}`}
                      >
                        <p className={styles.occurrenceDate}>
                          {formatJalaliDate(occurrence.date)}
                        </p>
                        <p className={styles.occurrenceMeta}>
                          <span dir="ltr">
                            {occurrence.startTime}–{occurrence.endTime}
                          </span>
                          <span>
                            {occurrence.price === 0
                              ? t("free")
                              : t("price", {
                                  amount: occurrence.price.toLocaleString("fa-IR"),
                                })}
                          </span>
                        </p>
                        <p
                          className={
                            occurrence.remaining > 0
                              ? styles.available
                              : styles.full
                          }
                        >
                          {occurrence.remaining > 0
                            ? t("remaining", { count: occurrence.remaining })
                            : t("full")}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.empty}>{t("scheduleEmpty")}</p>
                )}
                {calendar ? (
                  <p className={styles.timezone}>
                    {t("timezone", { timezone: calendar.timezone })}
                  </p>
                ) : null}
              </section>
            </div>
            <aside className={styles.aside}>
              <p className={styles.clubLabel}>{t("hostClub")}</p>
              <p className={styles.clubName}>{item.club.name}</p>
              <Link className={styles.primaryCta} href="/#download">
                {t("openApp")}
              </Link>
              <Link
                className={styles.secondaryCta}
                href={`/clubs/${item.club.id}`}
              >
                {t("viewClub")}
              </Link>
            </aside>
          </div>
        </article>
      </main>
      <PublicSiteFooter />
    </>
  );
}
