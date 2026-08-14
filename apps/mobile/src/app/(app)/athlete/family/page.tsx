import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteFamilyAccountsGate } from "@/modules/athlete/lib/AthleteFamilyAccountsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteFamily");
  return { title: t("pageTitle") };
}

export default function AthleteFamilyPage() {
  return <AthleteFamilyAccountsGate />;
}
