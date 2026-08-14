import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerConsentsGate } from "@/modules/owner/lib/OwnerConsentsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerConsents");
  return { title: t("pageTitle") };
}

export default function OwnerConsentsPage() {
  return <OwnerConsentsGate />;
}
