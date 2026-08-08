import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ATHLETE_BOOKINGS } from "@/modules/athlete/lib/bookings-data";
import { AthleteBookingsScreen } from "@/modules/athlete/screens/AthleteBookingsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteBookings");
  return { title: t("pageTitle") };
}

export default function AthleteBookingsPage() {
  return <AthleteBookingsScreen bookings={ATHLETE_BOOKINGS} />;
}
