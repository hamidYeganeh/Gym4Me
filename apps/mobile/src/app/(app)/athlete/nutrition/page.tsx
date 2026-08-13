import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteNutritionGate } from "@/modules/athlete/lib/AthleteNutritionGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteNutrition");
  return { title: t("pageTitle") };
}

export default function AthleteNutritionPage() {
  return <AthleteNutritionGate />;
}
