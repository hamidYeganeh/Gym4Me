import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachNutritionGate } from "@/modules/coach/lib/CoachNutritionGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachNutrition");
  return { title: t("pageTitle") };
}

export default function CoachNutritionPage() {
  return <CoachNutritionGate />;
}
