import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AchievementsScreen } from "@/modules/account/screens/AchievementsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Achievements");
  return { title: t("title") };
}

export default function Page() {
  return <AchievementsScreen />;
}
