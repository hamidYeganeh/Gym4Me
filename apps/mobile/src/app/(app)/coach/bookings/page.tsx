import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CoachBookingsGate } from "@/modules/coach/lib/CoachBookingsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachBookings");
  return { title: t("pageTitle") };
}

export default function CoachBookingsPage() {
  return <CoachBookingsGate />;
}
