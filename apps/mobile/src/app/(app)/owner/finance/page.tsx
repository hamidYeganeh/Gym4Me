import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerFinanceGate } from "@/modules/owner/lib/OwnerFinanceGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerFinance");
  return { title: t("pageTitle") };
}

export default function OwnerFinancePage() {
  return <OwnerFinanceGate />;
}
