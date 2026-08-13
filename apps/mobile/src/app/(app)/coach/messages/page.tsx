import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachMessagesGate } from "@/modules/coach/lib/CoachMessagesGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachMessages");
  return { title: t("pageTitle") };
}

export default function CoachMessagesPage() {
  return <CoachMessagesGate />;
}
