import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteHealthAssessmentGate } from "@/modules/athlete/lib/AthleteHealthAssessmentGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteHealthAssessment");
  return { title: t("pageTitle") };
}

export default function AthleteHealthAssessmentPage() {
  return <AthleteHealthAssessmentGate />;
}
