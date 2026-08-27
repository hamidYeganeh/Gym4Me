import { TextWithBrand } from "@repo/ui/kit/LineShadowText";
import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/shared/components/JsonLd";
import {
  basicsLocations,
  discoveryClubs,
  discoveryCoaches,
} from "@/shared/lib/api";
import { seoCityScreenStyles as styles } from "./SeoCityScreen.styles";
import type { SeoCityScreenProps } from "./SeoCityScreen.types";

export async function SeoCityScreen({ locationId }: SeoCityScreenProps) {
  const t = await getTranslations("PublicCity");
  let city: Awaited<ReturnType<typeof basicsLocations.getCity>>;
  let clubs: Awaited<ReturnType<typeof discoveryClubs.list>>["result"] = [];
  let coaches: Awaited<ReturnType<typeof discoveryCoaches.list>>["result"] = [];

  try {
    city = await basicsLocations.getCity(locationId);
  } catch {
    notFound();
  }

  const [clubsPage, coachesPage] = await Promise.all([
    discoveryClubs
      .list({ locationId, page_size: 100 })
      .catch(() => null),
    discoveryCoaches
      .list({ cityId: locationId, page_size: 100 })
      .catch(() => null),
  ]);
  clubs = clubsPage?.result ?? [];
  coaches = coachesPage?.result ?? [];

  return (
    <>
      <PublicSiteHeader />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("title", { city: city.name }),
          about: {
            "@type": "City",
            name: city.name,
          },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: clubs.length + coaches.length,
            itemListElement: [
              ...clubs.map((club, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `/clubs/${club.id}`,
                name: club.identity.name,
              })),
              ...coaches.map((coach, index) => ({
                "@type": "ListItem",
                position: clubs.length + index + 1,
                url: `/coaches/${coach.userId}`,
                name:
                  [coach.user.name.first, coach.user.name.last]
                    .filter(Boolean)
                    .join(" ") || t("fallbackCoach"),
              })),
            ],
          },
        }}
      />
      <main className={styles.root}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 className={styles.title}>{t("title", { city: city.name })}</h1>
          {city.description ? (
            <p className={styles.description}>{city.description}</p>
          ) : null}
          <p className={styles.meta}>
            {t("clubCount", { count: clubs.length })} · {t("coachCount", { count: coaches.length })}
          </p>
        </header>
        <div className={styles.sections}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t("clubs")}</h2>
            {clubs.length ? (
              <ul className={styles.list}>
                {clubs.map((club) => (
                  <li className={styles.item} key={club.id}>
                    <Link className={styles.link} href={`/clubs/${club.id}`}>
                      {club.identity.name}
                    </Link>
                    <p className={styles.address}>
                      {club.location?.address ?? t("unknownAddress")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>{t("emptyClubs")}</p>
            )}
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t("coaches")}</h2>
            {coaches.length ? (
              <ul className={styles.list}>
                {coaches.map((coach) => {
                  const name =
                    [coach.user.name.first, coach.user.name.last]
                      .filter(Boolean)
                      .join(" ") || t("fallbackCoach");
                  return (
                    <li className={styles.item} key={coach.id}>
                      <Link
                        className={styles.link}
                        href={`/coaches/${coach.userId}`}
                      >
                        <TextWithBrand>{name}</TextWithBrand>
                      </Link>
                      <p className={styles.address}>
                        {coach.experience.headline ?? coach.bio}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.empty}>{t("emptyCoaches")}</p>
            )}
          </section>
        </div>
      </main>
      <PublicSiteFooter />
    </>
  );
}
