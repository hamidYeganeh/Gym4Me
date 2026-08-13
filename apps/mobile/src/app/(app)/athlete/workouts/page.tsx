import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteWorkoutsGate } from "@/modules/athlete/lib/AthleteWorkoutsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteWorkouts");
  return { title: t("pageTitle") };
}

export default function AthleteWorkoutsPage() {
  return <AthleteWorkoutsGate />;
}
