import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerHolidaysGate } from "@/modules/owner/lib/OwnerHolidaysGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerHolidays");
  return { title: t("pageTitle") };
}

export default function OwnerHolidaysPage() {
  return <OwnerHolidaysGate />;
}
