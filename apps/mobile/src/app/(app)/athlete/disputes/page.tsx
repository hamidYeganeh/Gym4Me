import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteDisputeGate } from "@/modules/athlete/lib/AthleteDisputeGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteDisputes");
  return { title: t("pageTitle") };
}

export default function AthleteDisputesPage() {
  return <AthleteDisputeGate />;
}
