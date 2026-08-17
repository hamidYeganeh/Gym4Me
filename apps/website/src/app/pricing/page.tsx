import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PricingScreen } from "@/modules/marketing/screens/PricingScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MarketingLanding.pricing");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/pricing" },
  };
}

export default function PricingPage() {
  return <PricingScreen />;
}
