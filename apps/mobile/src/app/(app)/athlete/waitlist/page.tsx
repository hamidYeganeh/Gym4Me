import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteWaitlistGate } from "@/modules/athlete/lib/AthleteWaitlistGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteWaitlist");
  return { title: t("pageTitle") };
}

export default function AthleteWaitlistPage() {
  return <AthleteWaitlistGate />;
}
