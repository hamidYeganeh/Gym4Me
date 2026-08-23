import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteNutritionPlanGate } from "@/modules/athlete/lib/AthleteNutritionPlanGate";
import { DEMO_MEAL_PLANS } from "@/modules/athlete/lib/nutrition-data";
import {
  buildDemoStaticParams,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type NutritionPlanPageProps = {
  params: Promise<{ planId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => DEMO_MEAL_PLANS.map(({ id: planId }) => ({ planId })),
    [{ planId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteNutrition");
  return { title: t("detailPageTitle") };
}

export default async function AthleteNutritionPlanPage({
  params,
}: NutritionPlanPageProps) {
  const { planId } = await params;
  return <AthleteNutritionPlanGate planId={planId} />;
}
