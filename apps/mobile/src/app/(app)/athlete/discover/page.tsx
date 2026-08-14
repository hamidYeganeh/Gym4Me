import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoveryHomeScreenLoader } from "@/modules/discovery/screens/DiscoveryHomeScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiscoveryHome");
  return { title: t("pageTitle") };
}

export default function AthleteDiscoveryPage() {
  return <DiscoveryHomeScreenLoader compact />;
}
