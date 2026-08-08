import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COACH_EARNINGS } from "@/modules/coach/lib/coach-earnings-data";
import { CoachEarningsScreen } from "@/modules/coach/screens/CoachEarningsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachEarnings");
  return { title: t("pageTitle") };
}

export default function CoachEarningsPage() {
  return <CoachEarningsScreen earnings={COACH_EARNINGS} />;
}
