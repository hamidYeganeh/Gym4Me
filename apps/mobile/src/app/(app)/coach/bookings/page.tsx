import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { COACH_BOOKING_REQUESTS } from "@/modules/coach/lib/coach-bookings-data";
import { CoachBookingsScreen } from "@/modules/coach/screens/CoachBookingsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CoachBookings");
  return { title: t("pageTitle") };
}

export default function CoachBookingsPage() {
  return <CoachBookingsScreen bookings={COACH_BOOKING_REQUESTS} />;
}
