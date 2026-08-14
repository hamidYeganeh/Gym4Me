import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerCashShiftGate } from "@/modules/owner/lib/OwnerCashShiftGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerCashShift");
  return { title: t("pageTitle") };
}

export default function OwnerCashShiftPage() {
  return <OwnerCashShiftGate />;
}
