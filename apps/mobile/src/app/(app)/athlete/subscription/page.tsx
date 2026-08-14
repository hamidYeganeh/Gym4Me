import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteSubscriptionGate } from "@/modules/athlete/lib/AthleteSubscriptionGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteSubscription");
  return { title: t("pageTitle") };
}

export default function AthleteSubscriptionPage() {
  return <AthleteSubscriptionGate />;
}
