import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerDebtsGate } from "@/modules/owner/lib/OwnerDebtsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerDebts");
  return { title: t("pageTitle") };
}

export default function OwnerDebtsPage() {
  return <OwnerDebtsGate />;
}
