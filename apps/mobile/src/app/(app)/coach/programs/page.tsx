import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachProgramsGate } from "@/modules/coach/lib/CoachProgramsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachPrograms");
  return { title: t("pageTitle") };
}

export default function CoachProgramsPage() {
  return <CoachProgramsGate />;
}
