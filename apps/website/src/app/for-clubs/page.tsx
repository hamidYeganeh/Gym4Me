import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AudienceLandingScreen } from "@/modules/marketing/screens/AudienceLandingScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MarketingLanding.audience.clubs");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/for-clubs" },
  };
}

export default function ForClubsPage() {
  return <AudienceLandingScreen audience="clubs" />;
}
