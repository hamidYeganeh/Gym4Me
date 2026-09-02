import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AthleteBookingRescheduleScreen } from "@/modules/athlete/screens/AthleteBookingRescheduleScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteBookingReschedule");
  return { title: t("pageTitle") };
}

export default function AthleteBookingRescheduleQueryPage() {
  return <Suspense><AthleteBookingRescheduleScreen /></Suspense>;
}
