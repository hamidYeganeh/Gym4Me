import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AthleteBookingsGate } from "@/modules/athlete/lib/AthleteBookingsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteBookings");
  return { title: t("pageTitle") };
}

export default function AthleteBookingsPage() {
  return <AthleteBookingsGate />;
}
