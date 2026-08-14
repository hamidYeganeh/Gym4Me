import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerWalkInBookingGate } from "@/modules/owner/lib/OwnerWalkInBookingGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerWalkInBooking");
  return { title: t("pageTitle") };
}

export default function OwnerWalkInBookingPage() {
  return <OwnerWalkInBookingGate />;
}
