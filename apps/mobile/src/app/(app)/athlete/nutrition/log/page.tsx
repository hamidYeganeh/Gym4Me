import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteNutritionLogGate } from "@/modules/athlete/lib/AthleteNutritionLogGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteNutrition");
  return { title: t("logPageTitle") };
}

export default function AthleteNutritionLogPage() {
  return <AthleteNutritionLogGate />;
}
