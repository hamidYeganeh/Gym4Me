import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllBookingIds } from "@/modules/athlete/lib/bookings-data";
import {
  buildDemoStaticParams,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";
import { AthleteBookingRescheduleScreen } from "@/modules/athlete/screens/AthleteBookingRescheduleScreen";

type BookingReschedulePageProps = {
  params: Promise<{ bookingId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => getAllBookingIds().map((bookingId) => ({ bookingId })),
    [{ bookingId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteBookingReschedule");
  return { title: t("pageTitle") };
}

export default async function BookingReschedulePage({
  params,
}: BookingReschedulePageProps) {
  const { bookingId } = await params;

  return <AthleteBookingRescheduleScreen bookingId={bookingId} />;
}
