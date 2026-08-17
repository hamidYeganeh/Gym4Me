import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AudienceLandingScreen } from "@/modules/marketing/screens/AudienceLandingScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MarketingLanding.audience.athletes");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/for-athletes" },
  };
}

export default function ForAthletesPage() {
  return <AudienceLandingScreen audience="athletes" />;
}
