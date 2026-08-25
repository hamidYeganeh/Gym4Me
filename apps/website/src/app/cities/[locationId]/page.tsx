import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SeoCityScreen } from "@/modules/discovery/screens/SeoCityScreen";
import { basicsLocations } from "@/shared/lib/api";

type Props = {
  params: Promise<{ locationId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationId } = await params;
  const t = await getTranslations("PublicCity");
  try {
    const city = await basicsLocations.getCity(locationId);
    return {
      title: t("metaTitle", { city: city.name }),
      description: t("metaDescription", { city: city.name }),
      alternates: { canonical: `/cities/${city.id}` },
    };
  } catch {
    return { title: t("metaTitle", { city: locationId }) };
  }
}

export default async function CitySeoPage({ params }: Props) {
  const { locationId } = await params;
  return <SeoCityScreen locationId={locationId} />;
}
