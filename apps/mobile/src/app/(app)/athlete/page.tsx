import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteHomeScreen } from "@/modules/athlete/screens/AthleteHomeScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteHome");
  return { title: t("title") };
}

export default function AthleteHomePage() {
  return <AthleteHomeScreen />;
}
