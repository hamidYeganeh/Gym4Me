import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerFamilyMembershipsGate } from "@/modules/owner/lib/OwnerFamilyMembershipsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerFamilyMemberships");
  return { title: t("pageTitle") };
}

export default function OwnerFamilyMembershipsPage() {
  return <OwnerFamilyMembershipsGate />;
}
