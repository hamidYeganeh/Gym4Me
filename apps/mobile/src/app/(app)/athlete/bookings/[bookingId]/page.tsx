import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AthleteBookingDetailGate } from "@/modules/athlete/lib/AthleteBookingDetailGate";
import { getAllBookingIds } from "@/modules/athlete/lib/bookings-data";
import {
  buildDemoStaticParams,
  STATIC_EXPORT_PLACEHOLDER_ID,
} from "@/shared/lib/runtime-mode";

type BookingDetailPageProps = {
  params: Promise<{ bookingId: string }>;
};

export function generateStaticParams() {
  return buildDemoStaticParams(
    () => getAllBookingIds().map((bookingId) => ({ bookingId })),
    [{ bookingId: STATIC_EXPORT_PLACEHOLDER_ID }],
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AthleteBookingDetail");
  return { title: t("pageTitle") };
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { bookingId } = await params;

  return (
    <Suspense>
      <AthleteBookingDetailGate bookingId={bookingId} />
    </Suspense>
  );
}
