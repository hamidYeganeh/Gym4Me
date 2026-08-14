import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerInvoicesGate } from "@/modules/owner/lib/OwnerInvoicesGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerInvoices");
  return { title: t("pageTitle") };
}

export default function OwnerInvoicesPage() {
  return <OwnerInvoicesGate />;
}
