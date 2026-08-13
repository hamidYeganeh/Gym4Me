import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachEarningsGate } from "@/modules/coach/lib/CoachEarningsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachEarnings");
  return { title: t("pageTitle") };
}

export default function CoachEarningsPage() {
  return <CoachEarningsGate />;
}
