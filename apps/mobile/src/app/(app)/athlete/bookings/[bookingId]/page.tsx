import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  getAllBookingIds,
  getBooking,
} from "@/modules/athlete/lib/bookings-data";
import { AthleteBookingDetailScreen } from "@/modules/athlete/screens/AthleteBookingDetailScreen";

type BookingDetailPageProps = {
  params: Promise<{ bookingId: string }>;
};

export function generateStaticParams() {
  return getAllBookingIds().map((bookingId) => ({ bookingId }));
}

export async function generateMetadata({
  params,
}: BookingDetailPageProps): Promise<Metadata> {
  const { bookingId } = await params;
  const booking = getBooking(bookingId);
  const t = await getTranslations("AthleteBookingDetail");

  return { title: booking?.title ?? t("pageTitle") };
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { bookingId } = await params;

  return <AthleteBookingDetailScreen booking={getBooking(bookingId)} />;
}
