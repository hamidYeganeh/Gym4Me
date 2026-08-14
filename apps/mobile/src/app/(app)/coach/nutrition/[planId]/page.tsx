import type { Metadata } from "next";
import { CoachNutritionPlanGate } from "@/modules/coach/lib/CoachNutritionPlanGate";
import {
  getAllCoachNutritionPlanIds,
  getCoachNutritionPlan,
} from "@/modules/coach/lib/coach-nutrition-data";

type CoachNutritionPlanPageProps = {
  params: Promise<{ planId: string }>;
};

export function generateStaticParams() {
  return getAllCoachNutritionPlanIds().map((planId) => ({ planId }));
}

export async function generateMetadata({
  params,
}: CoachNutritionPlanPageProps): Promise<Metadata> {
  const { planId } = await params;
  const plan = getCoachNutritionPlan(planId);
  return { title: plan?.title ?? "Nutrition Plan" };
}

export default async function CoachNutritionPlanPage({
  params,
}: CoachNutritionPlanPageProps) {
  const { planId } = await params;
  return <CoachNutritionPlanGate planId={planId} />;
}
