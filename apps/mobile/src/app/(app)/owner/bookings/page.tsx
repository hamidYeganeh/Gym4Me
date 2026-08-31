import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerBookingsGate } from "@/modules/owner/lib/OwnerBookingsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerBookings");
  return { title: t("pageTitle") };
}

export default function OwnerBookingsPage() {
  return <OwnerBookingsGate />;
}
