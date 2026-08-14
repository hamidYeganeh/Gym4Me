import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerCoachesGate } from "@/modules/owner/lib/OwnerCoachesGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerCoaches");
  return { title: t("pageTitle") };
}

export default function OwnerCoachesPage() {
  return <OwnerCoachesGate />;
}
