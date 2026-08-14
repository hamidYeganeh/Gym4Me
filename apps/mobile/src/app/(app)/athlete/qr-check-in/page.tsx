import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteQrCheckInGate } from "@/modules/athlete/lib/AthleteQrCheckInGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteQrCheckIn");
  return { title: t("pageTitle") };
}

export default function AthleteQrCheckInPage() {
  return <AthleteQrCheckInGate />;
}
