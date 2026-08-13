import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteSocialFeedGate } from "@/modules/athlete/lib/AthleteSocialFeedGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteSocial");
  return { title: t("pageTitle") };
}

export default function AthleteSocialPage() {
  return <AthleteSocialFeedGate />;
}
