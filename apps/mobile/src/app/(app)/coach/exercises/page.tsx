import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachExercisesGate } from "@/modules/coach/lib/CoachExercisesGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachExercises");
  return { title: t("pageTitle") };
}

export default function CoachExercisesPage() {
  return <CoachExercisesGate />;
}
