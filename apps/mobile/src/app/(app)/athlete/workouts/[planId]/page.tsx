import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteWorkoutDetailGate } from "@/modules/athlete/lib/AthleteWorkoutDetailGate";
import { DEMO_WORKOUT_PLANS } from "@/modules/athlete/lib/workout-programs-data";
import {
  buildDemoStaticParams,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type WorkoutDetailPageProps = {
  params: Promise<{ planId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => DEMO_WORKOUT_PLANS.map(({ id: planId }) => ({ planId })),
    [{ planId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteWorkouts");
  return { title: t("detailPageTitle") };
}

export default async function AthleteWorkoutDetailPage({
  params,
}: WorkoutDetailPageProps) {
  const { planId } = await params;
  return <AthleteWorkoutDetailGate planId={planId} />;
}
