import {
  PublicSiteFooter,
  PublicSiteHeader,
} from "@/shared/components/PublicSiteHeader";
import { JsonLd } from "@/shared/components/JsonLd";
import { discoveryClubs } from "@/shared/lib/api";
import { seoCityScreenStyles as styles } from "./SeoCityScreen.styles";
import type { SeoCityScreenProps } from "./SeoCityScreen.types";

export async function SeoCityScreen({ locationId }: SeoCityScreenProps) {
  let clubs: Awaited<ReturnType<typeof discoveryClubs.list>>["result"] = [];

  try {
    const page = await discoveryClubs.list({
      locationId,
      page_size: 50,
    });
    clubs = page.result;
  } catch {
    clubs = [];
  }

  const cityName =
    clubs[0] && "location" in clubs[0] && clubs[0].location
      ? (clubs[0].location.address.split("،")[0] ?? locationId)
      : locationId;

  return (
    <>
      <PublicSiteHeader />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `باشگاه‌های ${cityName}`,
          numberOfItems: clubs.length,
          itemListElement: clubs.map((club, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `/clubs/${club.id}`,
            name: club.identity.name,
          })),
        }}
      />
      <main className={styles.root}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>شهر</p>
          <h1 className={styles.title}>باشگاه‌های {cityName}</h1>
          <p className={styles.meta}>{clubs.length} باشگاه تأییدشده</p>
        </header>
        <ul className={styles.list}>
          {clubs.map((club) => (
            <li className={styles.item} key={club.id}>
              <a className={styles.link} href={`/clubs/${club.id}`}>
                {club.identity.name}
              </a>
              <p className={styles.address}>
                {club.location?.address ?? "آدرس نامشخص"}
              </p>
            </li>
          ))}
        </ul>
      </main>
      <PublicSiteFooter />
    </>
  );
}
