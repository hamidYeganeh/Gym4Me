import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OWNER_FINANCE } from "@/modules/owner/lib/owner-finance-data";
import { OwnerFinanceScreen } from "@/modules/owner/screens/OwnerFinanceScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerFinance");
  return { title: t("pageTitle") };
}

export default function OwnerFinancePage() {
  return <OwnerFinanceScreen finance={OWNER_FINANCE} />;
}
