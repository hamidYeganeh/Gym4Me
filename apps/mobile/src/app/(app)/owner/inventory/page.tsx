import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerInventoryGate } from "@/modules/owner/lib/OwnerInventoryGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerInventory");
  return { title: t("pageTitle") };
}

export default function OwnerInventoryPage() {
  return <OwnerInventoryGate />;
}
