import type { Metadata } from "next";
import { CoachNutritionPlanGate } from "@/modules/coach/lib/CoachNutritionPlanGate";
import {
  getAllCoachNutritionPlanIds,
  getCoachNutritionPlan,
} from "@/modules/coach/lib/coach-nutrition-data";
import {
  buildDemoStaticParams,
  canUseDemoFixtureId,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type CoachNutritionPlanPageProps = {
  params: Promise<{ planId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => getAllCoachNutritionPlanIds().map((planId) => ({ planId })),
    [{ planId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata({
  params,
}: CoachNutritionPlanPageProps): Promise<Metadata> {
  const { planId } = await params;
  const plan = canUseDemoFixtureId(planId)
    ? getCoachNutritionPlan(planId)
    : undefined;
  return { title: plan?.title ?? "Nutrition Plan" };
}

export default async function CoachNutritionPlanPage({
  params,
}: CoachNutritionPlanPageProps) {
  const { planId } = await params;
  return <CoachNutritionPlanGate planId={planId} />;
}
