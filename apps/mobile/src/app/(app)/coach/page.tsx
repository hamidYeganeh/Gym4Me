import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachHomeScreen } from "@/modules/coach/screens/CoachHomeScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachHome");
  return { title: t("title") };
}

export default function CoachHomePage() {
  return <CoachHomeScreen />;
}
