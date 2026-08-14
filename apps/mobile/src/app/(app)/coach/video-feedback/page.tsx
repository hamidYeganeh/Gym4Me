import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachVideoFeedbackGate } from "@/modules/coach/lib/CoachVideoFeedbackGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachVideoFeedback");
  return { title: t("pageTitle") };
}

export default function CoachVideoFeedbackPage() {
  return <CoachVideoFeedbackGate />;
}
