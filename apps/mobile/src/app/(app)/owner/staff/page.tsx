import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerStaffGate } from "@/modules/owner/lib/OwnerStaffGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerStaff");
  return { title: t("pageTitle") };
}

export default function OwnerStaffPage() {
  return <OwnerStaffGate />;
}
