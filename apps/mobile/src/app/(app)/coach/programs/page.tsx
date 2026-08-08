import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COACH_PROGRAMS } from "@/modules/coach/lib/coach-programs-data";
import { CoachProgramsScreen } from "@/modules/coach/screens/CoachProgramsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachPrograms");
  return { title: t("pageTitle") };
}

export default function CoachProgramsPage() {
  return <CoachProgramsScreen programs={COACH_PROGRAMS} />;
}
