import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerShiftsGate } from "@/modules/owner/lib/OwnerShiftsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerShifts");
  return { title: t("pageTitle") };
}

export default function OwnerShiftsPage() {
  return <OwnerShiftsGate />;
}
