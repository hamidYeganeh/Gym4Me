import type { Metadata } from "next";
import { JsonLd } from "@/modules/discovery/lib/JsonLd";
import { SeoCityScreen } from "@/modules/discovery/screens/SeoCityScreen";
import { discoveryClubs } from "@/shared/lib/api";

type Props = {
  params: Promise<{ locationId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationId } = await params;
  return {
    title: `باشگاه‌های ${locationId} | Gym4Me`,
    description: `فهرست باشگاه‌های تأییدشده در ${locationId}`,
  };
}

export default async function CitySeoPage({ params }: Props) {
  const { locationId } = await params;
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
      ? clubs[0].location.address.split("،")[0] ?? locationId
      : locationId;

  return (
    <>
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
      <SeoCityScreen cityName={cityName} clubs={clubs} />
    </>
  );
}
