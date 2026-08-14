import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthletePassesGate } from "@/modules/athlete/lib/AthletePassesGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthletePasses");
  return { title: t("pageTitle") };
}

export default function AthletePassesPage() {
  return <AthletePassesGate />;
}
