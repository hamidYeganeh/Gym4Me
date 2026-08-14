import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteMessagesGate } from "@/modules/athlete/lib/AthleteMessagesGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteMessages");
  return { title: t("pageTitle") };
}

export default function AthleteMessagesPage() {
  return <AthleteMessagesGate />;
}
