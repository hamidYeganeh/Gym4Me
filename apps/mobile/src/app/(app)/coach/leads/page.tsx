import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachLeadsGate } from "@/modules/coach/lib/CoachLeadsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachLeads");
  return { title: t("pageTitle") };
}

export default function CoachLeadsPage() {
  return <CoachLeadsGate />;
}
