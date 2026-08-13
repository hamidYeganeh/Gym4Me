import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerCheckInDeskGate } from "@/modules/owner/lib/OwnerCheckInDeskGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerCheckInDesk");
  return { title: t("pageTitle") };
}

export default function OwnerCheckInDeskPage() {
  return <OwnerCheckInDeskGate />;
}
