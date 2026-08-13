import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteReferralGate } from "@/modules/athlete/lib/AthleteReferralGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteReferral");
  return { title: t("pageTitle") };
}

export default function AthleteReferralPage() {
  return <AthleteReferralGate />;
}
