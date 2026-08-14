import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OwnerCouponsGate } from "@/modules/owner/lib/OwnerCouponsGate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerCoupons");
  return { title: t("pageTitle") };
}

export default function OwnerCouponsPage() {
  return <OwnerCouponsGate />;
}
