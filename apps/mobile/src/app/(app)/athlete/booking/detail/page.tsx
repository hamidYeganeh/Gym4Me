import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AthleteBookingDetailGate } from "@/modules/athlete/lib/AthleteBookingDetailGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteBookingDetail");
  return { title: t("pageTitle") };
}

export default function AthleteBookingDetailQueryPage() {
  return <Suspense><AthleteBookingDetailGate /></Suspense>;
}
